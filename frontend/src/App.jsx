import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useSmoothScroll } from './hooks/useSmoothScroll.js'
import { CartProvider } from './context/CartContext.jsx'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'
import Privacy from './pages/Privacy.jsx'
import Shop from './pages/Shop.jsx'
import Terms from './pages/Terms.jsx'

function AppRoutes() {
  useSmoothScroll()

  return (
    <Routes>
      <Route element={<Home />} path="/" />
      <Route element={<Shop />} path="/shop" />
      <Route element={<Privacy />} path="/privacy" />
      <Route element={<Terms />} path="/terms" />
      <Route element={<NotFound />} path="*" />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </BrowserRouter>
  )
}
