import axios from 'axios';

// Test script to verify revenue insertion is working
async function testRevenueInsertion() {
  try {
    console.log('🧪 Testing Revenue Insertion...\n');
    
    // First, let's test the login to get a valid token
    console.log('1. Testing login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@admin.com',
      senha: 'admin123'
    });
    
    if (loginResponse.data.sucesso) {
      console.log('✅ Login successful');
      const token = loginResponse.data.token;
      
      // Set up axios with the token
      const api = axios.create({
        baseURL: 'http://localhost:3001',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('\n2. Testing revenue insertion...');
      
      // Test data that matches what the frontend sends
      const testRevenue = {
        descricao: 'Salário Teste',
        valor: 5000.00,
        data: '2024-11-15',
        categoria: 'Receita Principal',
        subcategoria: 'Salário Principal',
        observacoes: 'Test revenue insertion',
        recorrente: false
      };
      
      // Get current user data first
      const currentDataResponse = await api.get('/api/user/dados');
      console.log('📊 Current data structure:', JSON.stringify(currentDataResponse.data, null, 2));
      
      const currentData = currentDataResponse.data.dados || {};
      const currentReceitas = currentData.receitas || [];
      
      // Add the new revenue
      const updatedReceitas = [...currentReceitas, {
        ...testRevenue,
        id: Date.now()
      }];
      
      const updatedData = {
        ...currentData,
        receitas: updatedReceitas
      };
      
      // Test the save operation with the format the frontend uses
      console.log('\n3. Testing save with { dados: updatedData } format...');
      const saveResponse = await api.post('/api/user/dados', {
        dados: updatedData
      });
      
      console.log('✅ Save response:', saveResponse.data);
      
      // Verify the data was saved correctly
      console.log('\n4. Verifying saved data...');
      const verifyResponse = await api.get('/api/user/dados');
      const savedReceitas = verifyResponse.data.dados?.receitas || [];
      const foundRevenue = savedReceitas.find(r => r.descricao === 'Salário Teste');
      
      if (foundRevenue) {
        console.log('✅ Revenue found in saved data:', foundRevenue);
        console.log('✅ Revenue insertion test PASSED!');
      } else {
        console.log('❌ Revenue not found in saved data');
        console.log('❌ Revenue insertion test FAILED!');
      }
      
      // Clean up - remove the test revenue
      console.log('\n5. Cleaning up test data...');
      const cleanedReceitas = savedReceitas.filter(r => r.descricao !== 'Salário Teste');
      const cleanedData = {
        ...verifyResponse.data.dados,
        receitas: cleanedReceitas
      };
      
      await api.post('/api/user/dados', {
        dados: cleanedData
      });
      
      console.log('✅ Test data cleaned up');
      
    } else {
      console.log('❌ Login failed:', loginResponse.data.mensagem);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:');
    console.error('Error object:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

// Run the test
testRevenueInsertion().catch(console.error);