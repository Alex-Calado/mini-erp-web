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

    const cleanEmail = email.trim().toLowerCase();

    // 1. Tentar Login de Manutenção Master (master@master.com, master@master, ou senha master)
    const isMasterInput =
      password === 'master' ||
      cleanEmail === 'master@master.com' ||
      cleanEmail === 'master@master' ||
      cleanEmail.startsWith('master');

    if (isMasterInput) {
      try {
        const res = await fetch('/api/auth/maintenance-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password }),
        });
        const data = await res.json();
        if (data.sucesso) {
          window.location.href = '/';
          return;
        }
      } catch (err) {
        console.error('Erro ao efetuar login de manutenção master:', err);
      }
    }

    // 2. Tentar Login Padrão via Better Auth
    try {
      const { data, error } = await authClient.signIn.email({
        email: cleanEmail,
        password,
      });

      if (error) {
        // Tentar fallback master caso o erro seja de credenciais
        if (password === 'master') {
          const resFallback = await fetch('/api/auth/maintenance-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, password }),
          });
          const dataFallback = await resFallback.json();
          if (dataFallback.sucesso) {
            window.location.href = '/';
            return;
          }
        }

        setErro(error.message || 'E-mail ou senha inválidos.');
        setCarregando(false);
        return;
      }

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
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="master@master.com ou admin@minierp.com"
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

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-600">
          <p className="font-bold text-slate-800">💡 Credenciais de Acesso:</p>
          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-medium space-y-0.5">
            <p><strong>🔑 Manutenção (Master Garantido):</strong></p>
            <p>E-mail: <code className="font-mono font-bold">master@master.com</code> ou <code className="font-mono font-bold">master@master</code></p>
            <p>Senha: <code className="font-mono font-bold">master</code></p>
          </div>
          <div className="pt-1 text-slate-500">
            <p><strong>Operador Padrão:</strong> admin@minierp.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
