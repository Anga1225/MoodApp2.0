import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "./pages/dashboard";
import { HistoryPage } from "./pages/history";
import { AnalyticsPage } from "./pages/analytics";
import { ColorTherapyPage } from "./pages/color-therapy";
import { TestPage } from "./pages/test";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/history">
        {() => <HistoryPage onBack={() => window.history.back()} />}
      </Route>
      <Route path="/analytics">
        {() => <AnalyticsPage onBack={() => window.history.back()} />}
      </Route>
      <Route path="/color-therapy">
        {() => <ColorTherapyPage onBack={() => window.history.back()} />}
      </Route>
      <Route path="/test" component={TestPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
