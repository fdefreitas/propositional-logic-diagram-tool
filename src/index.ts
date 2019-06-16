import { VennDiagramGenerator } from "./venn-diagram-generator"
import { segmentTarget } from "./segment-target-data"

window.onload = function () {

	const canvas = document.getElementById('diagram-canvas') as HTMLCanvasElement

	if(!canvas) {
		throw new Error('Canvas element not found')
	}

	const diagramGenerator = new VennDiagramGenerator(segmentTarget, canvas)
	diagramGenerator.buildImage()
}