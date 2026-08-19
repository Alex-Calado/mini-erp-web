'use client';

import { useState } from 'react';
import { authClient } from '@/src/lib/auth-client';

export default function PaginaLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setErro(error.message || 'E-mail ou senha inválidos.');
        setCarregando(false);
        return;
      }

      // Redirecionamento completo para carregar a sessão nos cookies e servidor
      window.location.href = '/';
    } catch (err: any) {
      setErro('Falha na comunicação com o servidor de autenticação.');
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white font-extrabold text-xl rounded-xl shadow-lg mb-2">
            ERP
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Acesse o Mini ERP</h1>
          <p className="text-slate-500 text-sm">
            Informe suas credenciais de operador para acessar a plataforma
          </p>
        </div>

        {erro && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-medium">
            ⚠️ {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              E-mail de Acesso *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@minierp.com"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Senha *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-xs disabled:opacity-50 cursor-pointer mt-2"
          >
            {carregando ? 'Entrando no Sistema...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs text-slate-600">
          <p className="font-bold text-slate-800">💡 Credenciais Padrão de Teste:</p>
          <p><strong className="text-slate-700">E-mail:</strong> admin@minierp.com</p>
          <p><strong className="text-slate-700">Senha:</strong> admin123</p>
        </div>
      </div>
    </div>
  );
}
