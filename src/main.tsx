import { StrictMode } from 'react';import{createRoot}from'react-dom/client';import{ConfigProvider}from'antd';import{QueryClient,QueryClientProvider}from'@tanstack/react-query';import{BrowserRouter}from'react-router-dom';import'./index.css';import App from'./App';const client=new QueryClient({defaultOptions:{queries:{retry:1,refetchOnWindowFocus:false}}});

createRoot(document.getElementById('root')!).render(
  <StrictMode><ConfigProvider theme={{token:{colorPrimary:'#126b62',borderRadius:10}}}><QueryClientProvider client={client}><BrowserRouter><App/></BrowserRouter></QueryClientProvider></ConfigProvider></StrictMode>,
)
