import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const Lazer = () => {
  const [itens, setItens] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const [formulario, setFormulario] = useState({
    descricao: '',
    valor: '',
    data: '',
    categoria: 'entretenimento'
  });

  const categorias = [
    { value: 'entretenimento', label: 'Entretenimento' },
    { value: 'viagens', label: 'Viagens' },
    { value: 'restaurantes', label: 'Restaurantes' },
    { value: 'hobbies', label: 'Hobbies' },
    { value: 'eventos', label: 'Eventos' },
    { value: 'outros', label: 'Outros' }
  ];

  useEffect(() => {
    carregarItens();
  }, []);

  const carregarItens = () => {
    try {
      const dados = localStorage.getItem('LAZER');
      if (dados) {
        setItens(JSON.parse(dados));
      }
    } catch (error) {
      console.error('Erro ao carregar itens de lazer:', error);
    }
  };

  const salvarItens = (novosItens) => {
    try {
      localStorage.setItem('LAZER', JSON.stringify(novosItens));
      setItens(novosItens);
    } catch (error) {
      console.error('Erro ao salvar itens de lazer:', error);
      alert('Erro ao salvar item!');
    }
  };

  const adicionarItem = (e) => {
    e.preventDefault();

    if (!formulario.descricao || !formulario.valor || !formulario.data) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    const novoItem = {
      id: Date.now().toString(),
      descricao: formulario.descricao,
      valor: parseFloat(formulario.valor),
      data: formulario.data,
      categoria: formulario.categoria,
      dataCriacao: new Date().toISOString()
    };

    const itensAtualizados = [...itens, novoItem];
    salvarItens(itensAtualizados);

    setFormulario({
      descricao: '',
      valor: '',
      data: '',
      categoria: 'entretenimento'
    });
    setMostrarFormulario(false);
  };

  const editarItem = (e) => {
    e.preventDefault();

    const itensAtualizados = itens.map(i =>
      i.id === itemEditando.id
        ? {
            ...i,
            descricao: formulario.descricao,
            valor: parseFloat(formulario.valor),
            data: formulario.data,
            categoria: formulario.categoria
          }
        : i
    );

    salvarItens(itensAtualizados);

    setFormulario({
      descricao: '',
      valor: '',
      data: '',
      categoria: 'entretenimento'
    });
    setItemEditando(null);
    setMostrarFormulario(false);
  };

  const excluirItem = (id) => {
    if (!confirm('Deseja realmente excluir este item?')) return;

    const itensAtualizados = itens.filter(i => i.id !== id);
    salvarItens(itensAtualizados);
  };

  const iniciarEdicao = (item) => {
    setItemEditando(item);
    setFormulario({
      descricao: item.descricao,
      valor: item.valor.toString(),
      data: item.data,
      categoria: item.categoria
    });
    setMostrarFormulario(true);
  };

  const cancelarFormulario = () => {
    setFormulario({
      descricao: '',
      valor: '',
      data: '',
      categoria: 'entretenimento'
    });
    setItemEditando(null);
    setMostrarFormulario(false);
  };

  const totalLazer = itens.reduce((acc, i) => acc + i.valor, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lazer</h1>
          <p className="text-gray-600 mt-1">
            Total: R$ {totalLazer.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <Button onClick={() => setMostrarFormulario(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Item
        </Button>
      </div>

      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>{itemEditando ? 'Editar Item' : 'Novo Item'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={itemEditando ? editarItem : adicionarItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                <input
                  type="text"
                  value={formulario.descricao}
                  onChange={(e) => setFormulario({...formulario, descricao: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formulario.valor}
                    onChange={(e) => setFormulario({...formulario, valor: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                  <input
                    type="date"
                    value={formulario.data}
                    onChange={(e) => setFormulario({...formulario, data: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                <select
                  value={formulario.categoria}
                  onChange={(e) => setFormulario({...formulario, categoria: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  {itemEditando ? 'Salvar Alterações' : 'Adicionar Item'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelarFormulario} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {itens.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">Nenhum item de lazer cadastrado ainda.</p>
              <Button onClick={() => setMostrarFormulario(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          itens.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex justify-between items-center py-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.descricao}</h3>
                  <div className="flex gap-4 mt-1 text-sm text-gray-600">
                    <span>R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span>•</span>
                    <span>{new Date(item.data).toLocaleDateString('pt-BR')}</span>
                    <span>•</span>
                    <span className="capitalize">{categorias.find(c => c.value === item.categoria)?.label}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => iniciarEdicao(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => excluirItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Lazer;

