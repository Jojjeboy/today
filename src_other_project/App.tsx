import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { Layout } from './components/Layout'
import { GroceryListView } from './components/GroceryListView'

import { TodoView } from './components/TodoView'
import { ActivityLog } from './components/ActivityLog'
import { StatisticsView } from './components/StatisticsView'
import { SettingsView } from './components/SettingsView'
import { HistoryView } from './components/HistoryView'
import { ToastProvider } from './context/ToastContext'
import { ToastContainer } from './components/ToastContainer'
import { UpdatePrompt } from './components/UpdatePrompt'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ErrorBoundary } from './components/ErrorBoundary'

// Create the router configuration
const router = createHashRouter([
    {
        element: (
            <ProtectedRoute>
                <Layout>
                    <Outlet />
                    <ToastContainer />
                    <UpdatePrompt />
                </Layout>
            </ProtectedRoute>
        ),
        children: [
            {
                path: "/",
                element: <GroceryListView />,
            },
            {
                path: "/todos",
                element: <TodoView />,
            },
            {
                path: "/activity",
                element: <ActivityLog />,
            },
            {
                path: "/statistics",
                element: <StatisticsView />,
            },
            {
                path: "/history",
                element: <HistoryView />,
            },
            {
                path: "/settings",
                element: <SettingsView />,
            },
        ],
    },
]);

function App() {
    return (
        <ErrorBoundary>
            <ToastProvider>
                <AuthProvider>
                    <AppProvider>
                        <RouterProvider router={router} />
                    </AppProvider>
                </AuthProvider>
            </ToastProvider>
        </ErrorBoundary>
    )
}

export default App
