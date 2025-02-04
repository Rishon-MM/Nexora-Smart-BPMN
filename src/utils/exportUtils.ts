import { saveAs } from 'file-saver';
import BpmnJS from 'bpmn-js/lib/Modeler';

export type ExportFormat = 'bpmn' | 'svg' | 'png' | 'jpeg';

interface ExportOptions {
  format: ExportFormat;
  quality?: number;
  scale?: number;
}

export async function exportDiagram(
  modeler: BpmnJS, 
  options: ExportOptions
): Promise<void> {
  const { format } = options;

  try {
    switch (format) {
      case 'bpmn':
        await exportBPMN(modeler);
        break;
      case 'svg':
        await exportSVG(modeler);
        break;
      case 'png':
        await exportRaster(modeler, 'png');
        break;
      case 'jpeg':
        await exportRaster(modeler, 'jpeg');
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Error exporting diagram:', error);
    throw error;
  }
}

async function exportBPMN(modeler: BpmnJS): Promise<void> {
  const { xml } = await modeler.saveXML({ format: true });
  const blob = new Blob([xml], { type: 'application/xml' });
  saveAs(blob, 'diagram.bpmn');
}

async function exportSVG(modeler: BpmnJS): Promise<void> {
  const { svg } = await modeler.saveSVG();
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  saveAs(blob, 'diagram.svg');
}

async function exportRaster(modeler: BpmnJS, format: 'png' | 'jpeg'): Promise<void> {
  // Get the SVG from the modeler
  const { svg } = await modeler.saveSVG();
  
  // Create a new image element
  const image = new Image();
  
  // Convert SVG to base64 data URL
  const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);
  
  // Create a promise to handle image loading
  const imageLoadPromise = new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = url;
  });

  try {
    // Wait for the image to load
    await imageLoadPromise;

    // Create a canvas with the same dimensions
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Set canvas size to match the SVG viewBox or actual size
    const svgElement = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;
    const viewBox = svgElement.getAttribute('viewBox')?.split(' ').map(Number) || [];
    
    if (viewBox.length === 4) {
      canvas.width = viewBox[2];
      canvas.height = viewBox[3];
    } else {
      canvas.width = image.width;
      canvas.height = image.height;
    }

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Convert to blob and save
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `diagram.${format}`);
      }
    }, `image/${format}`, format === 'jpeg' ? 0.95 : undefined);

    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Error exporting ${format}:`, error);
    URL.revokeObjectURL(url);
    throw error;
  }
}