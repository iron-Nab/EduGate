import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { useTheme } from './hooks/use-theme';

export default function App() {
  useTheme();

  return (
    <>
      <Sidebar />
      <main className="flex-1 min-h-screen overflow-auto bg-surface">
        <Outlet />
      </main>
    </>
  );
}
