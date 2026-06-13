import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PlantsPage from './pages/PlantsPage';
import RecipesPage from './pages/RecipesPage';
import WizardPage from './pages/WizardPage';
import AddRecipePage from './pages/AddRecipePage';
import IngredientsPage from './pages/IngredientsPage';
import Cook from './pages/Cook';
import Grocery from './pages/Grocery';
import Pantry from './pages/Pantry';
import Planner from './pages/Planner';
import Suggest from './pages/Suggest';
import Bible from './pages/Bible';
import { ToastProvider } from './hooks/useToast';

type Page = 'home' | 'plants' | 'recipes' | 'wizard' | 'add-recipe' | 'ingredients' | 'cook' | 'grocery' | 'pantry' | 'planner' | 'suggest' | 'bible';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  function navigate(p: string) {
    setPage(p as Page);
    window.scrollTo(0, 0);
  }
  return (
    <ToastProvider>
      <div className="app-layout">
        <Sidebar currentPage={page} onNavigate={navigate} />
        <main className="main-content">
          {page === 'home'         && <Dashboard onNavigate={navigate} />}
          {page === 'plants'       && <PlantsPage />}
          {page === 'recipes'      && <RecipesPage onNavigate={navigate} />}
          {page === 'wizard'       && <WizardPage />}
          {page === 'add-recipe'   && <AddRecipePage onNavigate={navigate} />}
          {page === 'ingredients'  && <IngredientsPage />}
          {page === 'cook'         && <Cook />}
          {page === 'grocery'      && <Grocery />}
          {page === 'pantry'       && <Pantry />}
          {page === 'planner'      && <Planner />}
          {page === 'suggest'      && <Suggest />}
          {page === 'bible'        && <Bible />}
        </main>
      </div>
    </ToastProvider>
  );
}
