// Test script to verify revenue insertion is working with the fixed backend
import axios from 'axios';

async function testRevenueInsertionDirect() {
  try {
    console.log('🧪 Testing Revenue Insertion with Fixed Backend...\n');
    
    // Test data that matches what the frontend sends
    const testRevenue = {
      descricao: 'Salário Teste Sistema',
      valor: 5000.00,
      data: '2024-11-15',
      categoria: 'Receita Principal',
      subcategoria: 'Salário Principal',
      observacoes: 'Test revenue insertion with fixed backend',
      recorrente: false
    };
    
    // Simulate the data structure that the frontend sends
    const userData = {
      receitas: [{
        ...testRevenue,
        id: Date.now()
      }],
      despesas: [],
      orcamentos: [],
      metas: []
    };
    
    // Test the save operation with the format the frontend uses
    console.log('📤 Testing save with { dados: userData } format...');
    console.log('📊 Data being sent:', JSON.stringify({ dados: userData }, null, 2));
    
    // This simulates what the frontend does when saving
    const response = await fetch('http://localhost:3001/api/user/dados', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Simulating a token
      },
      body: JSON.stringify({ dados: userData })
    });
    
    const result = await response.json();
    console.log('✅ Save response:', result);
    
    if (result.sucesso) {
      console.log('✅ Revenue insertion test PASSED!');
      console.log('✅ The backend is correctly handling the { dados: data } format');
    } else {
      console.log('❌ Revenue insertion test FAILED!');
      console.log('❌ Error:', result.mensagem);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:');
    console.error('Error message:', error.message);
  }
}

// Run the test
testRevenueInsertionDirect();