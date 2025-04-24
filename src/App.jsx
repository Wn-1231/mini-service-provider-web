import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, App as AntApp } from 'antd';
import Navigation from './components/Navigation';
import AuthList from './pages/auth/AuthList';
import DraftList from './pages/template/DraftList';
import TemplateList from './pages/template/TemplateList';
import MiniappList from './pages/miniapp/MiniappList';
import OperationLog from './pages/miniapp/OperationLog';
import './App.css';

const { Sider, Content } = Layout;

function App() {
  return (
    <AntApp>
      <BrowserRouter>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider
            theme="light"
            width={200}
            style={{
              height: '100vh',
              position: 'fixed',
              left: 0,
              boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)'
            }}
          >
            <Navigation />
          </Sider>
          <Layout style={{ marginLeft: 200, minHeight: '100vh' }}>
            <Content className="site-content">
              <Routes>
                {/* 默认重定向到微信平台 */}
                <Route path="/" element={<Navigate to="/wechat/auth/list" replace />} />
                
                {/* 微信平台路由 */}
                <Route path="/wechat/auth/list" element={<AuthList platform="wechat" />} />
                <Route path="/wechat/template/draft" element={<DraftList platform="wechat" />} />
                <Route path="/wechat/template/list" element={<TemplateList platform="wechat" />} />
                <Route path="/wechat/miniapp/list" element={<MiniappList platform="wechat" />} />
                
                {/* 抖音平台路由 */}
                <Route path="/douyin/auth/list" element={<AuthList platform="douyin" />} />
                <Route path="/douyin/template/draft" element={<DraftList platform="douyin" />} />
                <Route path="/douyin/template/list" element={<TemplateList platform="douyin" />} />
                <Route path="/douyin/miniapp/list" element={<MiniappList platform="douyin" />} />

                {/* 小程序路由 */}
                <Route path="/miniapp/list" element={<MiniappList />} />
                <Route path="/miniapp/operation-log" element={<OperationLog />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </BrowserRouter>
    </AntApp>
  );
}

export default App;
