  const fetchHeldTransactions = async () => {
    try {
      const salesSessionId = localStorage.getItem('salesSessionId');
      const response = await axios.get(`http://localhost:5000/api/products/held-transactions?salesSessionId=${salesSessionId}`);
      if (response.data) {
        setHeldTransactions(response.data);
      }
    } catch (error) {
      console.error('Error fetching held transactions:', error);
      showMessage('Failed to fetch held transactions', 'error');
    }
  }; 