import { SegmentTarget } from "./venn-diagram-generator"

export const segmentTarget: SegmentTarget = {
	"and": true,
	"segment_groups": [
		// OR, included segments
		{
			"and": false,
			"segments": [
				{
					"segment": "594290cce87847ed4b761e7b",
					"include": true
				},
				{
					"segment": "594290d1e87847ed4b761e87",
					"include": true
				},
				{
					"segment": "594290cce87847ed4b761e7b",
					"include": true
				},
				{
					"segment": "594290d1e87847ed4b761e87",
					"include": true
				}
			]
		},
		// AND, included segments
		{
			"and": true,
			"segments": [
				{
					"segment": "594290cce87847ed4b761e7b",
					"include": true
				},
				{
					"segment": "594290d1e87847ed4b761e87",
					"include": true
				}
			]
		},
		// OR, excluded segments
		{
			"and": false,
			"segments": [
				{
					"segment": "594290cce87847ed4b761e7b",
					"include": false
				},
				{
					"segment": "594290d1e87847ed4b761e87",
					"include": false
				},
				{
					"segment": "594290d1e87847ed4b761e87",
					"include": false
				},
				{
					"segment": "594290d1e87847ed4b761e87",
					"include": false
				}
			]
		},
		// AND, excluded segments
		{
			"and": true,
			"segments": [
				{
					"segment": "594290cce87847ed4b761e7b",
					"include": false
				},
				{
					"segment": "594290d1e87847ed4b761e87",
					"include": false
				}
			]
		},
		// OR, Mixed
		{
			"and": false,
			"segments": [
				{
					"segment": "5cdaa7ac8a70e311005c829f",
					"include": false
				},
				{
					"segment": "5cdaa7ac8a70e311005c829f",
					"include": false
				},
				{
					"segment": "5cdaa7ac8a70e311005c829f",
					"include": false
				},
				{
					"segment": "594290cce87847ed4b761e7b",
					"include": true
				},
				{
					"segment": "594290d1e87847ed4b761e87",
					"include": true
				},
				{
					"segment": "594290cce87847ed4b761e7b",
					"include": true
				},
				{
					"segment": "594290d1e87847ed4b761e87",
					"include": true
				}
			]
		},
		// AND, Mixed
		{
			"and": true,
			"segments": [
				{
					"segment": "5cdaa7ac8a70e311005c829f",
					"include": false
				},
				{
					"segment": "5cdaa7ac8a70e311005c829f",
					"include": false
				},
				{
					"segment": "5cdaa7ac8a70e311005c829f",
					"include": false
				},
				{
					"segment": "5cdaa7ac8a70e311005c829f",
					"include": false
				},
				{
					"segment": "594290cce87847ed4b761e7b",
					"include": true
				},
				{
					"segment": "594290d1e87847ed4b761e87",
					"include": true
				},
				{
					"segment": "594290cce87847ed4b761e7b",
					"include": true
				},
				{
					"segment": "594290d1e87847ed4b761e87",
					"include": true
				}
			]
		}
	]
}