export const AppConstants = {
    title: 'Eta Regulator Board',
    version: '2023.07.05',
    company: 'Eta Ltd©',
    webApiRoot: process.env.NODE_ENV === 'production'
      ? 'http://10.10.10.1:5000'
      : 'http://127.0.0.1:5000'
  };