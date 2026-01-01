export const createMockStripe = () => ({
  paymentIntents: {
    create: jest.fn().mockResolvedValue({
      id: 'pi_mock_123',
      client_secret: 'pi_mock_secret_123',
      amount: 5000,
      currency: 'eur',
      status: 'requires_payment_method',
    }),
    retrieve: jest.fn().mockResolvedValue({
      id: 'pi_mock_123',
      status: 'succeeded',
    }),
    confirm: jest.fn().mockResolvedValue({
      id: 'pi_mock_123',
      status: 'succeeded',
    }),
  },
  charges: {
    create: jest.fn().mockResolvedValue({
      id: 'ch_mock_123',
      amount: 5000,
      status: 'succeeded',
    }),
  },
  customers: {
    create: jest.fn().mockResolvedValue({
      id: 'cus_mock_123',
      email: 'test@example.com',
    }),
  },
});
