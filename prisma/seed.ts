import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Semeando dados iniciais no PostgreSQL...');

  // Criar Clientes Iniciais
  const cliente1 = await prisma.cliente.upsert({
    where: { cpfCnpj: '12.345.678/0001-90' },
    update: {},
    create: {
      cpfCnpj: '12.345.678/0001-90',
      nome: 'Empresa Alfa Soluções Ltda',
      email: 'contato@alfa.com.br',
      telefone: '(11) 98888-1111',
    },
  });

  const cliente2 = await prisma.cliente.upsert({
    where: { cpfCnpj: '98.765.432/0001-10' },
    update: {},
    create: {
      cpfCnpj: '98.765.432/0001-10',
      nome: 'Comércio Beta S/A',
      email: 'vendas@comerciobeta.com',
      telefone: '(21) 97777-2222',
    },
  });

  // Criar Produtos Iniciais
  const prod1 = await prisma.produto.upsert({
    where: { codigoSku: 'PROD-001' },
    update: {},
    create: {
      codigoSku: 'PROD-001',
      nome: 'Monitor LED 27" Full HD',
      descricao: 'Monitor com painel IPS e 75Hz de taxa de atualização',
      preco: 899.90,
      estoque: 15,
    },
  });

  const prod2 = await prisma.produto.upsert({
    where: { codigoSku: 'PROD-002' },
    update: {},
    create: {
      codigoSku: 'PROD-002',
      nome: 'Teclado Mecânico Wireless',
      descricao: 'Teclado com switches azuis e retroiluminação RGB',
      preco: 349.00,
      estoque: 8,
    },
  });

  const prod3 = await prisma.produto.upsert({
    where: { codigoSku: 'PROD-003' },
    update: {},
    create: {
      codigoSku: 'PROD-003',
      nome: 'Mouse Gamer 16000 DPI',
      descricao: 'Mouse ergonômico com 6 botões programáveis',
      preco: 189.50,
      estoque: 3,
    },
  });

  console.log('✅ Dados de teste cadastrados com sucesso!');
  console.log(`- Clientes: ${cliente1.nome}, ${cliente2.nome}`);
  console.log(`- Produtos: ${prod1.nome}, ${prod2.nome}, ${prod3.nome}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
