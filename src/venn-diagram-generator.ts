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
		const rowSize = 3
		const groupsCount = this.segmentTargets.segment_groups.length
		const { maxInclude, maxExclude } = this.segmentTargets.segment_groups.reduce((acc, group) => {
			const includeSegments = group.segments.filter(segment => !!segment.include).length
			const excludeSegments = group.segments.filter(segment => !segment.include).length
			if(includeSegments > acc.maxInclude) {
				acc.maxInclude = includeSegments
			}
			if(excludeSegments > acc.maxExclude) {
				acc.maxExclude = excludeSegments
			}

			return acc
		}, {
			maxInclude: 0,
			maxExclude: 0
		})

		let maxSegments: number = 0
		if(maxInclude && maxInclude > maxExclude) {
			maxSegments = maxInclude
		} else {
			maxSegments = maxExclude
		}

		const circlePerimeter = (VennDiagramGenerator.SEGMENT_SIZE * VennDiagramGenerator.SEGMENT_SPACING) * maxSegments
		const circleRadius = circlePerimeter / (2 * Math.PI)
		const circleDiameter = circleRadius * 2
		const groupSize = circleDiameter
		this.canvas.height = groupSize * (groupsCount / rowSize) + 80
		this.canvas.width = (groupSize * rowSize) + 120
		console.info('Circle Radius:', circleRadius)
		console.info(`Canvas size: ${this.canvas.height}h x ${this.canvas.width}w`)

		// const PIXEL_RATIO = 0.5
		this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
		// context2d.transform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0)

		for (let index = 0; index < this.segmentTargets.segment_groups.length; index = index + rowSize) {
			for (let segmentIndex = index; segmentIndex < index + rowSize; segmentIndex++) {
				const segmentGroup = this.segmentTargets.segment_groups[segmentIndex]
				const result = this.createGroup(groupSize, segmentGroup, segmentIndex, rowSize)
				this.shapesMap.push(result)	
			}
		}
		console.log(this.shapesMap)
	}

	private createGroup(groupSize: number, group: SegmentGroup, index: number, rowSize: number): GroupRectangle {
		console.group('group', index)
		// 32 for 16px spacing each side
		const rectSize = groupSize + 32
		const rectX = (index % rowSize) * rectSize
		const rectY = ((index / rowSize) >> 0) * rectSize
		const rectangle = this.drawGroupRectangle(rectX, rectY, rectSize, index, 'black', group.and)

		const circleRadius = 0.3 * groupSize
		const circleOriginX = rectX + (0.5 * rectSize)
		const circleOriginY = rectY + (0.5 * rectSize)
		this.drawOrigin(circleOriginX, circleOriginY, group.and? 'red': 'green')
		let segments: any[] = []

		const includes = group.segments.filter((segment) => !!segment.include)
		if(includes.length) {
			segments = [...this.drawIncludeSegmentCircle(includes, circleRadius, circleOriginX, circleOriginY, group.and)]
		} else {
			const universeX = rectX + (0.5 * circleRadius)
			const universeY = rectY + (0.5 * circleRadius)
			this.drawRectangle(universeX, universeY, rectSize * 0.75, 'rgba(135, 206, 235, 0.8)', 'rgba(135, 206, 235, 0.8)')
		}

		const excludes = group.segments.filter((segment) => !segment.include)
		segments = [segments, ...this.drawExcludeSegmentCircle(excludes, circleRadius, circleOriginX, circleOriginY, group.and)]

		console.groupEnd()

		return {
			rectangle,
			x: rectX,
			y: rectY,
			segments
		}
	}

	private calculateGroupCoordinates(radius: number, angle: number, index: number, cx: number, cy: number, offset: number = 0): Coordinates {
		const theta = offset + this.degreesToRadians(angle * (index + 1))

		const result = this.polarToCartesian(radius, theta, cx, cy)
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

	private drawOrigin(cx: number, cy: number, style: string = 'black'): void {
		if(!this.ctx) {
			return
		}

		this.drawCircle(cx, cy, 2, style)
	}

	private drawIncludeSegmentCircle(segments: Segment[], circleRadius: number, cx: number, cy: number, and?: boolean): SegmentCircle[] {
		const includeStyle = and? 'rgba(50, 205, 50, 0.4)' : 'rgba(50, 205, 50, 0.8)'
		const includeRadius = and? 0.5 * circleRadius : circleRadius
		const segmentRadius = and? 3 * VennDiagramGenerator.SEGMENT_SIZE : 0.5 * VennDiagramGenerator.SEGMENT_SIZE
		
		return this.drawSegmentCircle(segments, includeRadius, includeStyle, cx, cy, segmentRadius)
	}

	private drawExcludeSegmentCircle(segments: Segment[], circleRadius: number, cx: number, cy: number, and?: boolean): SegmentCircle[] {
		const excludeStyle = 'rgba(255, 69, 0, 0.6)'
		const excludeRadius = and? 0.1 * circleRadius : 0.3 * circleRadius
		const segmentRadius = 0.5 * VennDiagramGenerator.SEGMENT_SIZE

		return this.drawSegmentCircle(segments, excludeRadius, excludeStyle, cx, cy, segmentRadius)
	}

	private drawSegmentCircle(segments: Segment[], groupRadius: number, style: string, cx: number, cy: number, segmentRadius: number, offset: number = 0): SegmentCircle[] {
		const ctx = this.ctx as CanvasRenderingContext2D
		const angle = 360 / segments.length

		return segments.map((segment, index) => {
			const circle = new Path2D()

			ctx.fillStyle = style

			let { x, y } = this.calculateGroupCoordinates(groupRadius, angle, index, cx, cy, offset)
			circle.arc(x, y, segmentRadius, 0, 2 * Math.PI)
			ctx.fill(circle)
			
			return {
				circle,
				radius: groupRadius,
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

	private drawGroupRectangle(x: number, y: number, size: number, index: number, color: string = 'black', and: boolean = false): Path2D {
		const rectangle = this.drawRectangle(x, y, size, color)
		this.drawGroupName(x, y, index, and)
		return rectangle
	}

	private drawRectangle(x: number, y: number, size: number, stroke: string = 'black', fill?: string): Path2D {
		const ctx = this.ctx as CanvasRenderingContext2D
		const rectangle = new Path2D()
		rectangle.rect(x, y, size, size)
		ctx.beginPath()
		ctx.strokeStyle = stroke
		ctx.stroke(rectangle)
		if(fill) {
			ctx.fillStyle = fill
			ctx.fill(rectangle)
		}
		ctx.closePath()
		return rectangle
	}

	private drawGroupName(x: number, y: number, index: number, and: boolean): void {
		const ctx = this.ctx as CanvasRenderingContext2D
		ctx.font = '0.75rem Arial'
		ctx.fillStyle = 'black'
		ctx.fillText(`Group ${index}${and? ' (and)': ''}`, x + 16, y + 16)
	}
}