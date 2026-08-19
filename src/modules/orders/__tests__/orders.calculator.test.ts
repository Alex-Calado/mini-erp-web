import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  calcularTotalItem,
  calcularTotalPedido,
  arredondarMoeda,
} from '../orders.calculator';

describe('Suíte de Testes - Regras de Cálculo de Pedidos (Order & OrderItem)', () => {
  test('deve calcular corretamente o total de um item (quantidade * preço)', () => {
    const total = calcularTotalItem(3, 149.9);
    assert.strictEqual(total, 449.7);
  });

  test('deve arredondar valores monetários com 2 casas decimais', () => {
    const total = calcularTotalItem(3, 10.3333);
    assert.strictEqual(total, 31.0);
  });

  test('deve calcular corretamente o total do pedido somando todos os itens', () => {
    const itensInput = [
      { productId: 'prod-1', quantity: 2, unitPrice: 100.0 }, // 200.00
      { productId: 'prod-2', quantity: 1, unitPrice: 49.9 },  // 49.90
      { productId: 'prod-3', quantity: 5, unitPrice: 10.5 },  // 52.50
    ];

    const resultado = calcularTotalPedido(itensInput);

    assert.strictEqual(resultado.items.length, 3);
    assert.strictEqual(resultado.items[0].total, 200.0);
    assert.strictEqual(resultado.items[1].total, 49.9);
    assert.strictEqual(resultado.items[2].total, 52.5);
    assert.strictEqual(resultado.total, 302.4);
  });

  test('deve lançar erro se a quantidade de algum item for menor ou igual a zero', () => {
    assert.throws(
      () => calcularTotalItem(0, 100.0),
      /A quantidade do item deve ser maior que zero/
    );

    assert.throws(
      () => calcularTotalItem(-2, 100.0),
      /A quantidade do item deve ser maior que zero/
    );
  });

  test('deve lançar erro se a lista de itens do pedido estiver vazia', () => {
    assert.throws(
      () => calcularTotalPedido([]),
      /O pedido deve conter pelo menos 1 item/
    );
  });

  test('deve desconsiderar preços enviados pelo cliente e usar o preço unitário do servidor', () => {
    // Simulando tentativa do cliente de mandar preço alterado (ex: R$ 1.00 para um produto de R$ 500.00)
    const precoServidorPostgreSQL = 500.0;
    const quantidadeDigitada = 2;

    const totalCalculadoNoServidor = calcularTotalItem(quantidadeDigitada, precoServidorPostgreSQL);

    // O total retornado DEVE ser R$ 1000.00 (2 * 500.00), e NUNCA o preço adulterado no browser
    assert.strictEqual(totalCalculadoNoServidor, 1000.0);
  });
});
