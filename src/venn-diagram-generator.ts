export interface SegmentTarget {
	and: boolean
	segment_groups: SegmentGroup[]
}

export interface SegmentGroup {
	and: boolean
	segments: Segment[]
}

export interface Segment {
	segment: string
	include: boolean
}

export interface SegmentCircle {
	circle: Path2D
	radius: number
	x: number
	y: number
	include: boolean
}

export interface GroupRectangle {
	rectangle: Path2D
	x: number
	y: number
	segments: SegmentCircle[]
}

export interface Coordinates {
	x: number
	y: number
}

export class VennDiagramGenerator {

	static readonly SEGMENT_SIZE = 32
	static readonly SEGMENT_SPACING = 8

	private shapesMap: any[] = []
	private ctx: CanvasRenderingContext2D | null = null

	constructor(private segmentTargets: SegmentTarget, private canvas: HTMLCanvasElement) {
		this.createCanvas()		
	}

	public buildImage(): void {
		return
	}

	private createCanvas(): void {
		const rowSize = 2
		const groupsCount = this.segmentTargets.segment_groups.length
		const maxSegments = this.segmentTargets.segment_groups.reduce((max, group) => {
			if(group.segments.length > max) {
				return group.segments.length
			}
			return max
		}, 0)

		const circlePerimeter = (VennDiagramGenerator.SEGMENT_SIZE * VennDiagramGenerator.SEGMENT_SPACING) * maxSegments
		const circleRadius = circlePerimeter / (2 * Math.PI)
		const circleDiameter = circleRadius * 2
		const groupSize = circleDiameter
		this.canvas.height = groupSize * (0.5 * groupsCount) + 64
		this.canvas.width = (groupSize * rowSize) + 48
		console.info('Circle Radius:', circleRadius)
		console.info(`Canvas size: ${this.canvas.height}h x ${this.canvas.width}w`)

		// const PIXEL_RATIO = 0.5
		this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
		// context2d.transform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0)

		for (let index = 0; index < this.segmentTargets.segment_groups.length; index = index + rowSize) {
			const rowIndex = Math.abs(0.5 * index)
			for (let segmentIndex = index; segmentIndex < index + rowSize; segmentIndex++) {
				const segmentGroup = this.segmentTargets.segment_groups[segmentIndex]
				const result = this.createGroup(groupSize, segmentGroup, segmentIndex, rowIndex)
				this.shapesMap.push(result)	
			}
		}
		console.log(this.shapesMap)
	}

	private createGroup(groupSize: number, group: SegmentGroup, index: number, rowIndex: number): GroupRectangle {
		console.group('group', index)
		// 32 for 16px spacing each side
		const rectSize = groupSize + 32
		const rectX = (index + 1) % 2 === 0? rectSize : 0
		const rectY = rectSize * rowIndex
		const rectangle = this.drawRectangle(rectX, rectY, rectSize, index)

		const circleRadius = 0.5 * groupSize
		const circleOriginX = rectX + (0.5 * rectSize)
		const circleOriginY = rectY + (0.5 * rectSize)
		this.drawOrigin(circleOriginX, circleOriginY)
		let segments: any[] = []

		if(group.and) {
			const includes = group.segments.filter((segment) => !!segment.include)
			if(includes.length) {
				const includeRadius = 0.6 * circleRadius
				const includeStyle = 'rgba(50, 205, 50, 0.6)'
				segments = [...this.drawSegmentCircle(includes, includeRadius, includeStyle, circleOriginX, circleOriginY)]
			} else {
				this.drawCircle(circleOriginX, circleOriginY, circleRadius, 'rgba(50, 205, 50, 0.4)')
			}

			const excludes = group.segments.filter((segment) => !segment.include)
			const excludeRadius = 0.2 * circleRadius
			const excludeStyle = 'rgba(255, 69, 0, 0.6)'
			segments = [segments, ...this.drawSegmentCircle(excludes, excludeRadius, excludeStyle, circleOriginX, circleOriginY)]

		} else {
			const includes = group.segments.filter((segment) => !!segment.include)
			if(includes.length) {
				const includeRadius = 0.6 * circleRadius
				const includeStyle = 'rgba(50, 205, 50, 0.6)'
				segments = [...this.drawSegmentCircle(includes, includeRadius, includeStyle, circleOriginX, circleOriginY)]
			} else {
				// blue = 'rgba(173, 216, 230, 0.6)'
				this.drawCircle(circleOriginX, circleOriginY, circleRadius, 'rgba(50, 205, 50, 0.4)')
			}
			const excludes = group.segments.filter((segment) => !segment.include)
			const excludeRadius = 0.2 * circleRadius
			const excludeStyle = 'rgba(255, 69, 0, 0.6)'
			segments = [segments, ...this.drawSegmentCircle(excludes, excludeRadius, excludeStyle, circleOriginX, circleOriginY)]
		}

		console.groupEnd()

		return {
			rectangle,
			x: rectX,
			y: rectY,
			segments
		}
	}

	private calculateGroupCoordinates(radius: number, angle: number, index: number, cx: number, cy: number): Coordinates {
		const theta = this.degreesToRadians(angle * (index + 1))

		const result = this.polarToCartesian(radius, theta, cx, cy)
		console.log('index', index, 'radius', radius, 'theta', theta, result, cx, cy)
		return result
	}

	private degreesToRadians(angleInDegrees: number): number {
		return Math.PI * angleInDegrees / 180;
	}

	private polarToCartesian(radius: number, theta: number, cx: number = 0, cy: number = 0): Coordinates {
		const x = cx + radius * Math.cos(theta)
		const y = cy + radius * Math.sin(theta)

		return {
			x,
			y
		}
	}

	private drawOrigin(cx: number, cy: number): void {
		if(!this.ctx) {
			return
		}

		this.drawCircle(cx, cy, 2, 'black')
	}

	private drawSegmentCircle(segments: Segment[], radius: number, style: string, cx: number, cy: number): SegmentCircle[] {
		const ctx = this.ctx as CanvasRenderingContext2D
		const segmentRadius = 0.5 * VennDiagramGenerator.SEGMENT_SIZE
		const angle = 360 / segments.length

		return segments.map((segment, index) => {
			const circle = new Path2D()

			ctx.fillStyle = style

			let { x, y } = this.calculateGroupCoordinates(radius, angle, index, cx, cy)
			circle.arc(x, y, segmentRadius, 0, 2 * Math.PI)
			ctx.fill(circle)
			
			return {
				circle,
				radius,
				x: cx,
				y: cy,
				include: segment.include
			}
		})
	}

	private drawCircle(cx: number, cy: number, radius: number, style: string): Path2D {
		const ctx = this.ctx as CanvasRenderingContext2D
		const circle = new Path2D()
		circle.arc(cx, cy, radius, 0, 2 * Math.PI)
		ctx.fillStyle = style
		ctx.fill(circle)

		return circle
	}

	private drawRectangle(x: number, y: number, size: number, index: number, color: string = 'black'): Path2D {
		const ctx = this.ctx as CanvasRenderingContext2D
		const rectangle = new Path2D()
		rectangle.rect(x, y, size, size)
		ctx.beginPath()
		ctx.strokeStyle = color
		ctx.stroke(rectangle)
		ctx.closePath()
		this.drawGroupName(x, y, index)
		return rectangle
	}

	private drawGroupName(x: number, y: number, index: number): void {
		const ctx = this.ctx as CanvasRenderingContext2D
		ctx.font = '0.75rem Arial'
		ctx.fillStyle = 'black'
		ctx.fillText(`Group ${index}`, x + 16, y + 16)
	}
}