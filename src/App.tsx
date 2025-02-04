import React, { useRef, useState } from 'react';
import { BpmnModeler } from './components/BpmnModeler';
import { AIChat } from './components/chat/AIChat';
import { ProjectWorkspace } from './components/workspace/ProjectWorkspace';
import { LoginPage } from './components/auth/LoginPage';
import BpmnJS from 'bpmn-js/lib/Modeler';
import { importBPMNXML } from './utils/bpmnUtils';
import { useAuthStore } from './store/authStore';
import { Menu } from 'lucide-react';
import { cn } from './utils/cn';

function App() {
  const modelerRef = useRef<BpmnJS | null>(null);
  const { user, isLoading } = useAuthStore();
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);

  const handleModelerInit = (modeler: BpmnJS) => {
    modelerRef.current = modeler;
  };

  const handleImportBPMN = async (xml: string) => {
    if (!modelerRef.current) return;

    try {
      await importBPMNXML(modelerRef.current, xml);
    } catch (error) {
      console.error('Error importing BPMN XML:', error);
      alert('Failed to import the BPMN diagram. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="h-screen bg-gray-100 overflow-hidden">
      <div className="flex h-full">
        {/* Mobile/Tablet Menu Button */}
        <button
          onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Workspace */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-40 transition-transform duration-300 transform lg:relative lg:translate-x-0",
            isWorkspaceOpen ? "translate-x-0" : "-translate-x-full",
            "lg:block"
          )}
        >
          <ProjectWorkspace onClose={() => setIsWorkspaceOpen(false)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row min-w-0">
          {/* Chat */}
          <div className="h-1/2 lg:h-full lg:w-[400px] border-b lg:border-b-0 lg:border-r bg-white">
            <AIChat onImportBPMN={handleImportBPMN} />
          </div>

          {/* BPMN Modeler */}
          <div className="flex-1 h-1/2 lg:h-full min-w-0">
            <BpmnModeler onModelerInit={handleModelerInit} />
          </div>
        </div>

        {/* Overlay for mobile/tablet */}
        {isWorkspaceOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsWorkspaceOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;