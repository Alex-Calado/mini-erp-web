import { auth } from '../src/lib/auth';
import { prisma } from '../src/db/prisma';

async function main() {
  console.log('Executando seed do banco de dados...');

  const adminEmail = 'admin@minierp.com';
  
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { accounts: true },
  });

  if (existingUser && existingUser.accounts.length === 0) {
    console.log('Removendo usuário sem conta de senha...');
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  const userAtual = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!userAtual) {
    console.log('Criando usuário administrador padrão (admin@minierp.com / admin123)...');
    await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: 'admin123',
        name: 'Operador ERP',
      },
    });
    console.log('Usuário admin criado com sucesso!');
  } else {
    console.log('Usuário admin já cadastrado e ativo.');
  }

  const countClientes = await prisma.cliente.count();
  if (countClientes === 0) {
    await prisma.cliente.createMany({
      data: [
        {
          nome: 'Empresa Alfa Ltda',
          cpfCnpj: '12345678000190',
          email: 'contato@alfa.com.br',
          telefone: '(11) 98888-7777',
          ativo: true,
        },
        {
          nome: 'João Silva',
          cpfCnpj: '11122233344',
          email: 'joao.silva@email.com',
          telefone: '(21) 97777-6666',
          ativo: true,
        },
      ],
    });
  }

  const countProdutos = await prisma.produto.count();
  if (countProdutos === 0) {
    await prisma.produto.createMany({
      data: [
        {
          codigoSku: 'PROD-001',
          nome: 'Notebook Dell Vostro',
          descricao: 'Processador i7, 16GB RAM, 512GB SSD',
          categoria: 'Informática',
          preco: 4500.0,
          estoque: 10,
          ativo: true,
        },
        {
          codigoSku: 'PROD-002',
          nome: 'Mouse Sem Fio Logitech',
          descricao: 'Ergonomico com sensor de alta precisao',
          categoria: 'Periféricos',
          preco: 120.5,
          estoque: 35,
          ativo: true,
        },
        {
          codigoSku: 'PROD-003',
          nome: 'Teclado Mecanico RGB',
          descricao: 'Switches azuis e retroiluminacao customizavel',
          categoria: 'Periféricos',
          preco: 350.0,
          estoque: 3,
          ativo: true,
        },
      ],
    });
  }

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
