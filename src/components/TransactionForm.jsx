import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Card } from './ui/Card';

const TransactionForm = ({ 
  categories, 
  onSubmit, 
  onCancel,
  initialData = null 
}) => {
  const [formData, setFormData] = useState(
    initialData || {
      data: new Date().toISOString().split('T')[0],
      categoria: '',
      mes: new Date().getMonth() + 1,
      descricao: '',
      valor: ''
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      valor: parseFloat(formData.valor) || 0
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="mb-6">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {initialData ? 'Editar' : 'Nova'} Transação
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Data</label>
            <Input
              type="date"
              name="data"
              value={formData.data}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <Select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <Input
              type="text"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descrição da transação"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Valor (R$)</label>
            <Input
              type="number"
              step="0.01"
              name="valor"
              value={formData.valor}
              onChange={handleChange}
              placeholder="0,00"
              required
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {initialData ? 'Atualizar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TransactionForm;
