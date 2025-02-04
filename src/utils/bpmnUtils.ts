import { saveAs } from 'file-saver';
import type BpmnJS from 'bpmn-js/lib/Modeler';
import type  Canvas  from 'diagram-js/lib/core/Canvas';


const DEFAULT_DIAGRAM = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn2:process id="Process_1" isExecutable="false">
    <bpmn2:startEvent id="StartEvent_1"/>
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds height="36.0" width="36.0" x="412.0" y="240.0"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`;

export async function initializeBpmnDiagram(modeler: BpmnJS): Promise<void> {
  try {
    const result = await modeler.importXML(DEFAULT_DIAGRAM);
    if (result.warnings?.length) {
      console.warn('Warnings while rendering BPMN diagram:', result.warnings);
    }
  } catch (error) {
    console.error('Error rendering BPMN diagram:', error);
    throw error;
  }
}

export async function exportBPMN(modeler: BpmnJS): Promise<void> {
  try {
    const { xml } = await modeler.saveXML({ format: true });
    const blob = new Blob([xml as string], { type: 'application/xml' });
    saveAs(blob, 'diagram.bpmn');
  } catch (err) {
    console.error('Error exporting BPMN diagram:', err);
    throw err;
  }
}


export async function importBPMNXML(modeler: BpmnJS, xml: string): Promise<void> {
  try {
    const result = await modeler.importXML(xml);
    if (result.warnings?.length) {
      console.warn('Warnings while importing BPMN XML:', result.warnings);
    }
    
    // Center the view after import
    const canvas = modeler.get('canvas') as Canvas;
    canvas.zoom('fit-viewport');
  } catch (error) {
    console.error('Error importing BPMN XML:', error);
    throw error;
  }
}