import React, { useEffect, useRef } from 'react';
import BpmnJS from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import { importBPMNXML, initializeBpmnDiagram } from '../utils/bpmnUtils';
import { exportDiagram, type ExportFormat } from '../utils/exportUtils';
import { TopBar } from './TopBar';
import { useProjectStore } from '../store/projectStore';
import { cn } from '../utils/cn';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface BpmnModelerProps {
  onModelerInit?: (modeler: BpmnJS) => void;
}

export function BpmnModeler({ onModelerInit }: BpmnModelerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<BpmnJS | null>(null);
  const { selectedProjectId, loadProjectData, saveBpmnDiagram } = useProjectStore();

  useEffect(() => {
    if (!containerRef.current) return;

    const modeler = new BpmnJS({
      container: containerRef.current,
      keyboard: {
        bindTo: document
      }
    });

    modelerRef.current = modeler;
    
    if (onModelerInit) {
      onModelerInit(modeler);
    }

    initializeBpmnDiagram(modeler).catch((error) => {
      console.error('Failed to initialize BPMN diagram:', error);
    });

    // Listen for save events
    const handleSave = async () => {
      if (!modelerRef.current || !selectedProjectId) return;
      try {
        const { xml } = await modelerRef.current.saveXML({ format: true });
        await saveBpmnDiagram(selectedProjectId, xml as string);
        
        // Show success message
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = 'Diagram saved successfully';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      } catch (error) {
        console.error('Error saving diagram:', error);
        alert('Failed to save the diagram. Please try again.');
      }
    };

    window.addEventListener('save-bpmn', handleSave);

    return () => {
      window.removeEventListener('save-bpmn', handleSave);
      modeler.destroy();
    };
  }, [onModelerInit, selectedProjectId, saveBpmnDiagram]);

  // Load BPMN diagram when project changes
  useEffect(() => {
    const loadBpmnDiagram = async () => {
      if (selectedProjectId && modelerRef.current) {
        const project = await loadProjectData(selectedProjectId);
        if (project?.bpmnXml) {
          await importBPMNXML(modelerRef.current, project.bpmnXml);
        } else {
          await initializeBpmnDiagram(modelerRef.current);
        }
      }
    };
    loadBpmnDiagram();
  }, [selectedProjectId, loadProjectData]);

  const handleSave = async () => {
    if (!modelerRef.current || !selectedProjectId) return;

    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      await saveBpmnDiagram(selectedProjectId, xml as string);
      
      // Show success message
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-10 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = 'Diagram saved successfully';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (error) {
      console.error('Error saving diagram:', error);
      alert('Failed to save the diagram. Please try again.');
    }
  };

  const handleImport = async (xml: string) => {
    if (!modelerRef.current || !selectedProjectId) return;

    try {
      await importBPMNXML(modelerRef.current, xml);
      await saveBpmnDiagram(selectedProjectId, xml);
    } catch (error) {
      console.error('Error importing BPMN diagram:', error);
      alert('Failed to import the diagram. Please check if the file is valid.');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          handleImport(content);
        };
        reader.readAsText(file);
      } catch (error) {
        console.error('Error reading file:', error);
        alert('Failed to read the file. Please try again.');
      }
      // Reset the input value to allow selecting the same file again
      event.target.value = '';
    }
  };

  const handleExport = async (format: ExportFormat) => {
    if (!modelerRef.current) return;

    try {
      await exportDiagram(modelerRef.current, { format });
    } catch (error) {
      console.error('Error exporting diagram:', error);
      alert(`Failed to export the diagram as ${format.toUpperCase()}. Please try again.`);
    }
  };

  const handleClear = async () => {
    if (!modelerRef.current || !selectedProjectId) return;

    try {
      await initializeBpmnDiagram(modelerRef.current);
      await saveBpmnDiagram(selectedProjectId, '');
    } catch (error) {
      console.error('Error clearing canvas:', error);
      alert('Failed to clear the canvas. Please try again.');
    }
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const tool = event.dataTransfer.getData('tool');
    
    if (modelerRef.current && tool) {
      const elementFactory = modelerRef.current.get('elementFactory');
      const create = modelerRef.current.get('create');
      
      const shape = elementFactory.createShape({ type: `bpmn:${tool}` });
      
      create.start(event, shape);
    }
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  // Initialize keyboard shortcuts
  const { importInputRef } = useKeyboardShortcuts({
    onSave: handleSave,
    disabled: !selectedProjectId
  });

  return (
    <div className="flex flex-col h-full">
      <TopBar 
        onSave={handleSave}
        onImport={handleImport}
        onExport={handleExport}
        onClear={handleClear}
        disabled={!selectedProjectId}
      />
      <input
        type="file"
        ref={importInputRef}
        onChange={handleFileChange}
        accept=".bpmn,.xml"
        className="hidden"
      />
      <div 
        ref={containerRef}
        onDrop={onDrop}
        onDragOver={onDragOver}
        className={cn(
          "flex-1 bg-white min-h-0",
          !selectedProjectId && "opacity-50 pointer-events-none"
        )}
      />
    </div>
  );
}