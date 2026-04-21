const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:8082/api/talent/key-talent-dashboard');
    console.log('Response code:', res.data.code);
    console.log('Stats:', JSON.stringify(res.data.data.stats, null, 2));
    console.log('List length:', res.data.data.list?.length || 0);
    if (res.data.data.list && res.data.data.list.length > 0) {
      console.log('First item:', JSON.stringify(res.data.data.list[0], null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
