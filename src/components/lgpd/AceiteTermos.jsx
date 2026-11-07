import React from 'react';
import { Link } from 'react-router-dom';

export default function AceiteTermos({ checked, onChange, error }) {
  return (
    <div>
      <label className="flex items-start gap-2 text-xs text-custom-main cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-yellow-500"
          aria-describedby={error ? 'aceite-termos-erro' : undefined}
        />
        <span>
          Li e concordo com os{' '}
          <Link to="/termos" target="_blank" className="font-bold text-custom-gold hover:underline">
            Termos de Uso
          </Link>{' '}
          e a{' '}
          <Link to="/privacidade" target="_blank" className="font-bold text-custom-gold hover:underline">
            Política de Privacidade
          </Link>
          .
        </span>
      </label>
      {error && (
        <p id="aceite-termos-erro" role="alert" className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
