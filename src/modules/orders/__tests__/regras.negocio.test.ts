import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  calcularTotalItem,
  calcularTotalPedido,
  arredondarMoeda,
} from '../orders.calculator';
import {
  validarEntidadeAtiva,
  validarEstoqueDisponivel,
  calcularEstornoCancelamento,
} from '../orders.validator';
import { CriarClienteSchema } from '@/src/modules/clientes/clientes.schemas';
import { CriarProdutoSchema } from '@/src/modules/produtos/produtos.schemas';
import { CriarPedidoSchema } from '@/src/modules/orders/orders.schemas';

describe('Suíte de Testes Automatizados - 5 Regras de Negócio Críticas do Mini ERP', () => {
  // ------------------------------------------------------------------
  // REGRA CRÍTICA 1 (FINANCEIRO): Cálculo seguro de total e arredondamento monetário
  // ------------------------------------------------------------------
  describe('Regra 1 [Financeiro]: Cálculo do total do pedido no backend e arredondamento preciso', () => {
    test('deve calcular e arredondar o total de cada item para 2 casas decimais', () => {
      const total = calcularTotalItem(3, 10.3333);
      assert.strictEqual(total, 31.0);
    });

    test('deve calcular o total do pedido somando itens e ignorando divergências do frontend', () => {
      // Preço confiável buscado no PostgreSQL no backend (ex: R$ 150.00)
      const itensServidor = [
        { productId: 'p1', quantity: 2, unitPrice: 150.0 }, // 300.00
        { productId: 'p2', quantity: 1, unitPrice: 49.99 }, // 49.99
      ];

      const resultado = calcularTotalPedido(itensServidor);
      assert.strictEqual(resultado.total, 349.99);
      assert.strictEqual(resultado.items[0].total, 300.0);
      assert.strictEqual(resultado.items[1].total, 49.99);
    });

    test('deve rejeitar itens com preços negativos ou quantidades zero/negativas', () => {
      assert.throws(
        () => calcularTotalItem(0, 100),
        /A quantidade do item deve ser maior que zero/
      );
      assert.throws(
        () => calcularTotalItem(2, -15),
        /O preço unitário do produto não pode ser negativo/
      );
    });
  });

  // ------------------------------------------------------------------
  // REGRA CRÍTICA 2 (INTEGRIDADE): Garantia de estoque não negativo
  // ------------------------------------------------------------------
  describe('Regra 2 [Integridade]: Validação de saldo de estoque disponível', () => {
    test('deve permitir a compra quando o saldo de estoque for suficiente', () => {
      assert.doesNotThrow(() => {
        validarEstoqueDisponivel({
          productId: 'prod-1',
          produtoNome: 'Notebook Dell',
          estoqueDisponivel: 10,
          quantidadeSolicitada: 3,
        });
      });
    });

    test('deve bloquear o pedido e lançar exceção quando a quantidade solicitada exceder o estoque', () => {
      assert.throws(
        () => {
          validarEstoqueDisponivel({
            productId: 'prod-1',
            produtoNome: 'Notebook Dell',
            estoqueDisponivel: 2,
            quantidadeSolicitada: 5,
          });
        },
        /Estoque insuficiente para o produto "Notebook Dell". Saldo disponível: 2 un, solicitado: 5 un./
      );
    });

    test('deve rejeitar solicitações com quantidade menor ou igual a zero', () => {
      assert.throws(
        () => {
          validarEstoqueDisponivel({
            productId: 'prod-1',
            produtoNome: 'Notebook Dell',
            estoqueDisponivel: 10,
            quantidadeSolicitada: 0,
          });
        },
        /A quantidade solicitada para "Notebook Dell" deve ser maior que zero/
      );
    });
  });

  // ------------------------------------------------------------------
  // REGRA CRÍTICA 3 (VALIDAÇÃO): Bloqueio de entidades inativas (Clientes e Produtos)
  // ------------------------------------------------------------------
  describe('Regra 3 [Validação]: Bloqueio de transações para Clientes e Produtos inativos', () => {
    test('deve aprovar transação quando Cliente e Produto estiverem ativos', () => {
      assert.doesNotThrow(() => {
        validarEntidadeAtiva({ tipo: 'Cliente', nome: 'Empresa ABC', ativo: true });
        validarEntidadeAtiva({ tipo: 'Produto', nome: 'Teclado Mecânico', ativo: true });
      });
    });

    test('deve bloquear pedidos quando o Cliente estiver inativo', () => {
      assert.throws(
        () => {
          validarEntidadeAtiva({ tipo: 'Cliente', nome: 'João Inadimplente', ativo: false });
        },
        /O cliente "João Inadimplente" está inativo e não pode realizar pedidos./
      );
    });

    test('deve bloquear pedidos quando o Produto estiver inativo no catálogo', () => {
      assert.throws(
        () => {
          validarEntidadeAtiva({ tipo: 'Produto', nome: 'Monitor Descontinuado', ativo: false });
        },
        /O produto "Monitor Descontinuado" está inativo no catálogo./
      );
    });
  });

  // ------------------------------------------------------------------
  // REGRA CRÍTICA 4 (INTEGRIDADE): Regras de cancelamento e estorno de estoque
  // ------------------------------------------------------------------
  describe('Regra 4 [Integridade]: Regras de cancelamento e cálculo de estorno de estoque', () => {
    test('deve calcular corretamente a devolução de estoque para pedido CONFIRMED', () => {
      const itensPedido = [
        { productId: 'prod-a', quantity: 2 },
        { productId: 'prod-b', quantity: 5 },
      ];

      const estornos = calcularEstornoCancelamento('CONFIRMED', itensPedido);

      assert.strictEqual(estornos.length, 2);
      assert.strictEqual(estornos[0].productId, 'prod-a');
      assert.strictEqual(estornos[0].incrementoEstoque, 2);
      assert.strictEqual(estornos[1].productId, 'prod-b');
      assert.strictEqual(estornos[1].incrementoEstoque, 5);
    });

    test('deve impedir re-cancelamento de pedidos já com status CANCELLED', () => {
      assert.throws(
        () => {
          calcularEstornoCancelamento('CANCELLED', [{ productId: 'prod-a', quantity: 1 }]);
        },
        /Este pedido já está cancelado./
      );
    });
  });

  // ------------------------------------------------------------------
  // REGRA CRÍTICA 5 (VALIDAÇÃO): Validação estrita de Schemas de Entrada (Zod)
  // ------------------------------------------------------------------
  describe('Regra 5 [Validação]: Validação estrita de entradas (CPF/CNPJ, SKU, preços)', () => {
    test('deve validar CPF/CNPJ com tamanho válido (mínimo 11 caracteres)', () => {
      const clienteValido = {
        cpfCnpj: '12345678901',
        nome: 'Maria Silva',
      };
      const res = CriarClienteSchema.safeParse(clienteValido);
      assert.strictEqual(res.success, true);

      const clienteInvalido = {
        cpfCnpj: '12345',
        nome: 'Maria Silva',
      };
      const resErr = CriarClienteSchema.safeParse(clienteInvalido);
      assert.strictEqual(resErr.success, false);
    });

    test('deve rejeitar produtos com código SKU em branco ou preço/estoque negativos', () => {
      const produtoSemSku = {
        codigoSku: '',
        nome: 'Mouse Gamer',
        preco: 50.0,
        estoque: 10,
      };
      assert.strictEqual(CriarProdutoSchema.safeParse(produtoSemSku).success, false);

      const produtoPrecoNegativo = {
        codigoSku: 'SKU-123',
        nome: 'Mouse Gamer',
        preco: -10.0,
        estoque: 5,
      };
      assert.strictEqual(CriarProdutoSchema.safeParse(produtoPrecoNegativo).success, false);
    });

    test('deve rejeitar pedidos sem itens no payload', () => {
      const pedidoSemItens = {
        customerId: '123e4567-e89b-12d3-a456-426614174000',
        items: [],
      };
      assert.strictEqual(CriarPedidoSchema.safeParse(pedidoSemItens).success, false);
    });
  });
});
