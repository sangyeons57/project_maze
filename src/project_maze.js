/**
 * 프로그램에서 사용하는 상수에 이름을 주기위해 만든 클래스
 */
class ConstantValues {
	constructor() {
		// 지도 심볼 번호
		this.wall = 1
		this.exit = 9
		this.noWall = 0
		this.shadow = 7
		this.noShadow = 0

		// 게임모드 표시 문자열 
		this.gameMode = "게임모드"
		this.devMode = "개발모드"

		// 지도 표시 색
		this.shadowColor = "black"
		this.wallColor = "gray"
		this.targetColor = "yellow"
		this.field_1_Color = "#04B404"
		this.field_2_Color = "#088A08"
		this.playerColor = 'blue'
		this.borderColor = 'purple'

	}
}

const VALUES = new ConstantValues()

/**
 * 게임에서 사용하는 지도의 기본 레이어 클래스
 * 지도의 기본 단위는 블럭으로 블럭을 채울 값을 가지는 2차원 지도를 레이어라고 한다
 */
class Layer {
	constructor() {
		this.width = undefined					// 레이어의 가로 길이
		this.height = undefined 				// 레이어의 세로 길이
		this.place = [] 						// 레이어 좌표 컬러를 저장하는 2차원 배열
	}

	/**
	 * 레이어를 주어진 크기로 만든다
	 * 주어진 값으로 초기화를 한다 
	 * value2가 있으면 한 줄 씩 번갈아 채운다 
	 *  
	 * @param {number} width - 2차원 레이어의 가로 길이 
	 * @param {number} height - 2차원 레이어의 세로 길이  
	 * @param {number|string} value -  컬러 값 1
	 * @param {number|string} value2 - 컬러 값 2 (value2 에 들어온 값이 없으면 쓰이지 않는다)
	 */
	create(width, height, value, value2=undefined) {
		this.width = width
		this.height = height
		for(let row = 0; row < height; row++){
			let place_row =[]
			for(let column = 0; column < width; column++){
				if(value2 && (row % 2 === 0)){
					place_row.push(value2)
				} else {
					place_row.push(value)
				}
			}
			this.place.push(place_row)
		}
	}

	/**
	 * Layer 내의 일부 지정된 네모 영역을 value로 채운다
	 */
	fillPlace(value, startY=0, startX=0, numY=1, numX=this.width) {
		for(let row = startY; row<startY + numY; row++) {
			this.place[row].fill(value, startX, startX + numX)
		}
	}

	/**
	 * 지정된 네모 영역의 값을 반환한다 
	 *   
	 * @param {number} startY - 반환할 영역의 시작 y 값
	 * @param {number} startX - 반환할 영역의 시작 x 값
	 * @param {number} numY - 반환할 영역의 끝 y 값(startY + numY 가 끝값이다.)
	 * @param {number} numX - 반환할 영역의 끝 x 값(stratX + numX 가 끝값이다.)
	 * @return {string[][]} - 잘라낸 2차원 리스트
	 */
	cutPlace(startY=0, startX=0, numY=1, numX=this.width) {
		const lines = this.place.filter((line, rowIndex) => rowIndex >= startY && rowIndex < startY + numY)
		return lines.map(line => line.filter((cell, columnIndex) => columnIndex >= startX && columnIndex < startX + numX))
	}

	/**
	 * 지정된 네모 영역을 자른 후 특정값으로 1 or 0 지도를 만든다 
	 */
	getOnOffMap(onValue, startY=0, startX=0, numY=1, numX=this.width) {
		const cutMap =  this.cutPlace(startY, startX, numY, numX)
		return cutMap.map(line => line.map(cell => cell === onValue ? 1 : 0 ))
	}

	/**
	 * Layer의 전체 영역을 같은 크기의 map 값으로 채운다
	 * @param {array[]} map
	 */
	fillPlaceMap(map) {
		this.place = map
	}


}

/**
 * WorldMap 클래스. Layer 클래스를 확장한다
 * @extends Layer
 */
class WorldLayer extends Layer {
	constructor(outerWallWidth, outerWallHeight) {
		super()
		this.owWidth = outerWallWidth			// 외벽 길이
		this.owHeight = outerWallHeight			// 외벽 높이
		this.mapWidth = undefined
		this.mapHeight = undefined
	}

	/**
	 * 지도 크기 변수 초기화
	 *  
	 * @param {*} width 
	 * @param {*} height 
	 */
	setMapSize(width, height) {
		this.mapWidth = width
		this.mapHeight = height
	}

	/**
	 * 외벽을 제외한 지도 부분에 컬러를 넣는 함수
	 *  
	 * @param {number|string} value - 컬러값 
	 * @param {number} row - 행 좌표 
	 * @param {number} column - 열 좌표 
	 */
	setMap(value, row, column) {
		this.place[this.owHeight + row][this.owWidth + column] = value
	}

	/**
	 * 월드 지도에서 해당 위치의 컬러를 받아온다 
	 * 
	 * @param {number} row 
	 * @param {number column 
	 */
	getPlaceColor(row, column) {
		return this.place[row][column]
	}


	/**
	 * level map을 그린다
	 * 레벨 지도에서 1 로된 부분을 gray로 바꾼다
	 * 
	 * @param {number[][]} levelMap  - 2차원 레벨 지도
	 */
	fillPlaceLevel(inColor, levelMap, tgColor) {
		levelMap.forEach((line, rowIndex) => line.forEach((color, columnIndex) => {
			color === VALUES.wall && this.setMap(inColor, rowIndex, columnIndex) 
			color === VALUES.exit && this.setMap(tgColor, rowIndex, columnIndex) 
		}))
	}

	/**
	 * 미로 바깥쪽 벽을 'gray' 컬러로 채운다
	 */
	fill_outer_wall(){
		this.fillPlace("gray", 0, 0, this.owHeight)
		this.fillPlace("gray", this.owHeight, 0, this.mapHeight, this.owWidth)
		this.fillPlace("gray", this.owHeight, this.width - this.owWidth, this.mapHeight, this.owWidth)
		this.fillPlace("gray", this.height - this.owHeight, 0, this.owHeight)
	}

}

/**
 * 벽 지도 클래스. Layer 클래스를 확장한다
 * @extends Layer
 */
class WallLayer extends Layer {
	/**
	 * 주어진 좌표가 길인지 확인하는 함수 
	 *  
	 * @param {number} row 
	 * @param {number} col 
	 * @returns {boolean}  - 주어진 좌표가 벽이 아니고 길이면 true 반환
	 */
	isPath(row, col) {
		return this.place[row][col] === VALUES.noWall
	}
}


/**
 * 그림자 지도 클래스. Layer 클래스를 확장한다
 * @extends Layer
 */
class ShadowLayer extends Layer {
	/**
	 * 전체를 주어진 값으로 초기화 한다
	 */
	reset(value) {
		this.place.map(line => line.fill(value))
	}

	/**
	 * 레벨에 따라 캐릭터 주변 시야가 넓어진다
	 * 
	 * @param {PlayerMaker} player - 플레이어  
	 * @param {number} radius - 캐릭터 주변 시야 반지름
	 */
	setSight(player, radius) {
		this.fillPlace(0, 
			player.screen_row - radius, player.screen_col - radius,
			radius*2 + 1, radius*2 + 1) 
	}

	/**
	 * 플레이어 중심으로 일직선 상의 시야를 표시한다 
	 *
	 * 플레이어 중심이므로 월드 지도 좌표가 아닌 스크린 좌표를 사용한다 
	 *  
	 * @param {WallLayer} wallMap    - 현재 벽 지도 
	 * @param {number} row  		 - 스크린상 행 좌표 
	 * @param {number} col  		 - 스크린상 열 좌표
	 * @param {string} dirName		 - 현재 시야 방향, 플레이어 위치는 초기값 
	 * @param {number} step          - 시야 진행 정도 표시 (디버깅용도) 
	 */

	chainSight(wallMap, row, col, dirName='', step=0) {
		this.place[row][col] = VALUES.noShadow

		const up = {name: 'up', y: row - 1, x:col}
		const down = {name: 'down', y: row + 1, x:col}
		const left = {name: 'left', y: row, x:col - 1}
		const right = {name: 'right', y: row, x:col + 1}
		const directions = [up, down, left, right]

		const isArea = (dir) => dir.y > 0 && dir.x > 0 && 
								dir.y < this.height && dir.x < this.width
	
		// 현재 위치에서 4방향 그림자 제거
		directions.forEach(dir => { 
			if ( isArea(dir)){
				this.place[dir.y][dir.x] = VALUES.noShadow 
			}
		})

		if(dirName) {
			// 플레이어 위치에서 벽으로 막혀있지 않은 방향이 벽으로 막힐때까지 진행 
			const sightDir = directions.find(dir => dir.name === dirName)
			if(isArea(sightDir) && wallMap.isPath(sightDir.y, sightDir.x)) {
				this.chainSight(wallMap, sightDir.y, sightDir.x, sightDir.name, ++step)
			}
		} else {
			// 플레이어 위치에서 4방향으로 시야 검사함
			directions.forEach(dir => {
				if(wallMap.isPath(dir.y, dir.x)) {
					this.chainSight(wallMap, dir.y, dir.x, dir.name, ++step)
				}
			})
		}
	}
	
}

/** 
 * 플레이어 클래스  
 * 
 * 스크린 영역 : 월드맵에서 캔버스에 표시할 플레이어 주변 영역
 */
class PlayerMaker {
	/**
	 * 초기 위치를 받아 플레이어 관련 변수를 설정한다
	 *  
	 * @param {number} centerRow  - 캔버스 가운데, 플레이어 초기 행 위치
	 * @param {number} centerCol  - 캔버스 가운데, 플레이어 초기 열 위치
	 */
	constructor(centerRow, centerCol) {
		this.screen_row = centerRow   	// 플레이어의 스크린상 위치, 불변 
		this.screen_col = centerCol  	// 플레이어의 스크린상 위치, 불변 
		this.world_row = centerRow		// 플레이어 월드맵 현재 행 위치
		this.world_col = centerCol		// 플레이어 월드맵 현재 열 위치
		this.prev_row = undefined		// 플레이어 월드맵 이전 행 위치
		this.prev_column = undefined	// 플레이어 월드맵 이전 열 위치
	}

	/**
	 * 월드 지도에서 스크린 영역의 왼쪽 위 행 좌표를 반환한다
	 */
	screenStartRow() {
		return  this.world_row - this.screen_row
	}

	/**
	 * 월드 지도에서 스크린 영역의 왼쪽 위 열 좌표를 반환한다
	 */
	screenStartCol() {
		return  this.world_col - this.screen_col
	}

	/**
	 * 플레이어 이동 함수   : 구 move_direction()
	 *  
	 * @param {string} direction      - 이동방향 4방향 
	 * @param {WorldLayer} worldMap   - 월드 지도 클래스
	 * @param {number} moveLength     - 현재 이동거리 
	 * @return {number}               - 업데이트된 이동거리
	 */
	move(direction, worldMap, moveLength) {
		// 이전 위치 저장
		this.prev_row = this.world_row
		this.prev_column = this.world_col
		// 플레이어 현재 좌표 이동
		switch(direction) {
			case "up": this.world_row--; break
			case "down": this.world_row++; break
			case "right": this.world_col++; break
			case "left": this.world_col--; break
		}
		moveLength++

		const playerPosition = worldMap.getPlaceColor(this.world_row, this.world_col)
		// 벽으로 이동했을 때 원래좌표로 복원
		if (playerPosition === VALUES.wallColor) {
			this.world_row = this.prev_row
			this.world_col = this.prev_column
			moveLength--
		}
		return moveLength
	}

	/**
	 * 플레이어 이동 정보를 초기화 한다
	 */
	reset() {
		this.world_row = this.screen_row 
		this.world_col = this.screen_col
		this.previous_row = undefined 
		this.previous_col = undefined 
	}
}

class CanvasDraw {
	constructor() {
		// 캔버스 설정
		const canvasTag = document.getElementById("canvas")
		this.ctx = canvasTag.getContext("2d")
		canvasTag.width = this.width = 210
		canvasTag.height = this.height = 210 

		this.blocksize = 10 
		this.border_block_size = 1
	}

	/**
	 * 스크린 영역에 canvas 함수로 실제 그리는 함수
	 *
	 * 현재 스크린 영역에 map으로 그림 그리는 경우는 두가지 인데
	 * 월드 지도 : 벽과 바닥을 여러가지 색으로 그린다
	 * 그림자 지도 : 그림자를 한가지 색으로 그린다 
	 *  
	 * @param {any[][]} blockMap  - 컬러맵 정보를 가진 2차원 배열 
	 * @param {boolean} isOneColor  - 그리는 색이 단색인지 아닌지
	 * @param {string} inColor - 기본값 매개변수, 단색 컬러
	 * @param {number} inValue - 기본값 매개변수, 맵의 단색 표시 확인값 
	 */
	drawScreen(blockMap, isOneColor, inColor='black', inValue=1) {
		// 플레이어 주변의 벽, 바닥 현재 상태 그리기
		blockMap.forEach((line, row) => {
			line.forEach((value, col) => {
				// isonecolor 값이 true 이면 incolor 값으로 아니면 value 를 통해 들어온 값으로 그리기.
				const color = isOneColor ? inColor : value
				if (!isOneColor || inValue === value) {
					this.ctx.fillStyle = color
					this.ctx.fillRect(
						(col + this.border_block_size)*this.blocksize, 
						(row + this.border_block_size)*this.blocksize,
						this.blocksize, this.blocksize)
				}
			})
		})
	}

	/**
	 * 
	 * @param {PlayerMaker} player 
	 */
	drawPlayer(player) {
		// 플레이어 그리기, 항상 캔버스 중간 위치
		this.ctx.fillStyle = VALUES.playerColor
		this.ctx.fillRect(
			(player.screen_row + this.border_block_size) * this.blocksize,
			(player.screen_col + this.border_block_size ) * this.blocksize, 
			this.blocksize,this.blocksize)
	}

	drawBorder() {
		this.ctx.fillStyle = VALUES.borderColor
		this.ctx.fillRect(0, 0, this.blocksize, this.height)
		this.ctx.fillRect(0, 0, this.width, this.blocksize)
		this.ctx.fillRect(0, this.height - this.blocksize, this.width, this.blocksize)
		this.ctx.fillRect(this.width - this.blocksize, 0, this.blocksize, this.height)
	}
}

/**
 * 게임 레벨별 지도를 저장하는 클래스 
 */
class LevelMap {
	constructor() {
		this.map_list=[
			[
			   //1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0
				[0,1,0,0,0,0,0,0,0,0],//1
				[0,1,0,1,1,0,1,0,1,0],//2
				[0,0,0,1,0,0,1,0,1,0],//3
				[1,1,0,1,0,1,0,0,1,0],//4
				[0,0,0,1,0,0,1,0,1,0],//5
				[0,1,1,0,1,1,0,1,0,0],//6
				[0,0,0,0,1,0,1,0,1,1],//7
				[0,1,1,1,0,0,0,0,0,0],//8
				[0,1,0,0,0,1,0,1,1,0],//9
				[0,0,0,1,0,1,0,0,1,9]//10
			],
			[
			   //1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0
				[0,1,0,0,0,0,1,0,0,0,0,0,0,0,0],
				[0,1,0,1,1,0,0,0,1,1,1,1,1,1,0],
				[0,0,0,1,0,0,1,0,0,0,0,0,0,1,0],
				[0,1,0,0,1,1,0,1,0,1,1,1,0,1,0],
				[0,0,1,0,0,0,0,1,1,0,0,0,1,0,0],
				[1,0,1,1,1,1,0,0,0,0,1,0,0,0,1],
				[0,0,0,0,0,0,1,0,1,0,0,1,1,1,0],
				[0,1,1,1,1,0,0,1,0,0,1,1,0,0,0],
				[0,1,0,0,0,1,0,0,1,0,0,0,0,1,0],
				[0,0,0,1,0,1,1,0,1,0,1,1,1,1,9]
			],
			[
				[0,0,0,0,1,0,0,0,1,0,0,0,0,0,0],
				[0,1,1,0,0,0,1,0,0,0,1,1,0,1,0],
				[0,0,0,1,0,1,0,0,1,1,1,0,0,1,0],
				[1,1,1,1,0,1,0,1,0,0,0,0,1,1,0],
				[0,0,0,0,0,1,0,0,1,0,0,1,0,0,0],
				[0,1,1,0,1,0,1,1,0,1,1,1,0,1,0],
				[0,0,1,0,0,0,0,0,1,0,0,0,1,1,1],
				[1,0,1,1,1,1,0,1,0,0,1,0,0,0,0],
				[0,0,1,0,0,1,0,1,0,1,0,1,1,1,0],
				[0,0,0,0,1,1,1,0,0,1,0,0,0,1,0],
				[1,1,0,1,0,0,1,0,1,0,1,1,0,1,0],
				[0,0,0,1,1,0,1,0,0,0,0,0,0,1,0],
				[0,1,1,0,0,0,1,1,1,1,1,0,0,1,0],
				[0,1,0,0,1,0,1,0,0,0,0,0,1,0,0],
				[0,0,0,1,0,0,0,0,1,0,1,0,0,1,9]
			]
			,
			[
			   //1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],//1
				[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],//2
				[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],//3
				[0,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0],//4
				[0,1,0,1,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,1,0],//5
				[0,1,0,1,0,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,0,1,0,1,1,0,1,0,1,0],//6
				[0,1,0,1,0,1,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,1,0],//7
				[0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,0],//8
				[0,1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,1,0],//9
				[0,1,0,0,0,1,0,1,0,1,0,1,0,1,1,0,1,1,1,1,0,1,0,1,1,0,1,0,1,0],//10
				[0,1,1,1,1,1,0,1,0,0,0,1,0,1,1,0,0,1,0,0,0,1,0,0,0,0,1,0,1,0],//11
				[0,1,0,0,0,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1,1,0,1,0],//12
				[0,1,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,0,1,0,0,0,1,0,1,0],//13
				[0,1,0,1,0,1,1,1,0,1,0,0,1,0,0,1,0,1,0,1,1,0,0,0,1,0,1,0,1,0],//14
				[0,1,0,1,0,0,0,1,0,1,1,0,1,0,1,0,0,1,0,0,1,1,1,0,1,0,1,0,1,0],//15
				[0,1,0,1,0,1,0,1,0,0,1,0,1,1,9,1,1,0,1,0,1,0,0,0,1,0,1,0,1,0],//16
				[0,1,0,1,0,1,0,1,1,0,1,0,0,0,0,1,0,0,0,0,1,0,1,0,1,0,0,0,1,0],//17
				[0,1,0,1,0,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,0],//18
				[0,1,0,1,0,1,1,1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,1,0,0,0,1,0,1,0],//19
				[0,1,0,1,0,0,0,1,1,1,0,1,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1,0,1,0],//20
				[0,1,0,1,0,1,0,1,0,1,0,1,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0],//21
				[0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0],//22
				[0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],//23
				[0,1,0,1,0,1,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,1,0,1,0],//24
				[0,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1,1,0,1,0,1,0],//25
				[0,1,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0],//26
				[0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,0,1,0],//27
				[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0],//28
				[0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],//29
				[0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],//30
			]
		]

	}

	/**
	 * @typedef {Object} LevelExitPosition
	 * @property {number} row - 레벨 지도에서 출구 행 좌표 
	 * @property {number} col - 레벨 지도에서 출구 열 좌표
	 * @param {*} level 
	 */
	/**
	 * 선택된 레벨 지도에서 출구를 찾는다
	 * 
	 * 출구값은 레벨 지도에서 VALUES.exit 값으로 표시된다
	 *  
	 * @param {number} level - 선택된 레벨
	 * @returns {LevelExitPostion} - 출구 좌표 
	 */
	findExit(level) {
		const rowIndex = this.map_list[level].findIndex(line => line.includes(VALUES.exit))
		const colIndex = this.map_list[level][rowIndex].indexOf(VALUES.exit)
		return { row: rowIndex, col: colIndex}
	}

	/**
	 * 선택된 레벨 지도를 반환 한다 ( 2차원 배열 ) 
	 * @param {number} level  - 레벨 선택
	 * @returns {number[][]}
	 */
	getLevelMap(level) {
		return this.map_list[level]
	}

	/**
	 * 선택된 레벨 지도의 가로, 세로 길이를 반환한다
	 *  
	 * @param {number} level - 레벨 선택 
	 * @returns {object}  -  레벨지도의 가로, 세로 길이, 출구의 레벨지도상 좌표 
	 */
	getInfo(level) {
		if (level < this.map_list.length) {
			const exitInfo = this.findExit(level)
			return { 
				width: this.map_list[level][0].length, 
				height: this.map_list[level].length,
				exitRow: exitInfo.row, 
				exitCol: exitInfo.col, 
			}
		} else {
			// 이전 레벨이 마지막 레벨로 더이상 레벨이 없음
			return undefined
		}
	}
}

/**
 * 지도 클래스
 * 
 * Layer 별 지도를 정의하고 각 지도를 서로 섞어서 사용할 때 이 클래스에서 메소드를 만든다. 
 * 
 */
class MapMaker {
	constructor() {
		const isOdd = n => Math.abs(n % 2) == 1		// 홀수이면 true를 반환한다 
		// 캔버스를 받아옴
		this.canvas = new CanvasDraw()
		this.levelMap = new LevelMap()

		this.blocksize = this.canvas.blocksize 
		this.border_block_size = this.canvas.border_block_size	// 테두리 블럭단위 너비
		const player_block_width = 1    // 플레이어가 차지하는 블럭 너비

		// 블럭 단위 길이
		const canvas_block_width = this.canvas.width / this.blocksize
		const canvas_block_height = this.canvas.height / this.blocksize
		console.assert(isOdd(canvas_block_width) && isOdd(canvas_block_height),
			`캔버스 크기를 블럭으로 나눈값은 홀수가 되어야 합니다 : ${canvas_block_width}, ${canvas_block_height}`)

		// 스크린 블럭 단위 길이 
		this.screen_width = canvas_block_width - 2 * this.border_block_size
		this.screen_height = canvas_block_height - 2 * this.border_block_size
		// 플레이어의 위치는 항상 스크린의 중심
		this.player_screen_Y = (this.screen_height - player_block_width) / 2  
		this.player_screen_X = (this.screen_width - player_block_width) / 2  
		// 외벽의 넓이는 스크린 사이즈의 절반으로 정하여
		// 플레이어가 레벨 지도의 가장자리에 있을때 스크린이 외벽으로 채워지도록 한다
		this.outer_wall_width = (this.screen_width - player_block_width) / 2
		this.outer_wall_height = (this.screen_height - player_block_width) / 2

	}

	/**
	 * 주어진 크기로 지도를 만든다
	 *  
	 * @param {number} width  - 지도 가로 크기
	 * @param {number} height - 지도 세로 크기 
	 */
	createWorld(width, height) {
		// 지도 객체 만들기
		this.world = new WorldLayer(this.outer_wall_width, this.outer_wall_height)  // 전체 지도
		this.wall = new WallLayer() // 벽 지도
		this.shadow = new ShadowLayer() // 그림자 지도
		// 지도 만들기 
		this.world.create(
			width + this.outer_wall_width*2, height + this.outer_wall_height*2, 
			VALUES.field_1_Color, VALUES.field_2_Color)
		this.world.setMapSize(width, height, this.outer_wall_width, this.outer_wall_height)
		this.world.fill_outer_wall()
		this.wall.create( this.screen_width, this.screen_height, VALUES.noWall)
		this.shadow.create( this.screen_width, this.screen_height, VALUES.shadow)
	}

	/**
	 * 전체지도에 레벨 지도를 표시한다.
	 * 
	 * 게임레벨을 올리면 지도가 확장된다
	 *  
	 * @param {number} level - 게임 레벨 
	 */
	setupLevelMap(level){
		this.world.fillPlaceLevel(VALUES.wallColor, this.levelMap.getLevelMap(level), VALUES.targetColor)
	}

	/**
	 * 개발 모드일 때 미로 벽 부분을 통과할 수 있게 만든다.
	 *  
	 * 대문자 'Gray' 벽은 통과 할 수 있고 소문자 'gray' 벽은 통과할 수 없다.
	 *  
	 * @param {number} level - 게임 레벨 
	 * @param {string} commandMode - 개발모드 or 게임모드 
	 */
	devModeWall(level, commandMode) {
		const wallColor = commandMode === VALUES.devMode ? 'Gray': VALUES.wallColor
		this.world.fillPlaceLevel(wallColor, this.levelMap.getLevelMap(level), VALUES.targetColor)
	} 

	/**
	 * 플레이어 주위의 월드지도를 가져온다 
	 * 
	 * @param {PlayerMaker} player  - 플레이어
	 * @return {string[][]} - 플레이어 주변의 스크린 영역만큼의 월드지도 
	 */
	getPlayerWorld(player) {
		return this.world.cutPlace(player.screenStartRow(), player.screenStartCol(), 
			this.screen_height, this.screen_width)
	}
	
	/**
	 * 플레이어의 위치에 따라 벽 지도를 업데이트 한다. 구 : updateScreenMap() 
	 * 
	 * @param {PlayerMaker} player  - 플레이어
	 */
	updateWallMap(player) {
		const screenWorldMap = this.world.getOnOffMap(VALUES.wallColor, 
			player.screenStartRow(), player.screenStartCol(), this.screen_height, this.screen_width)
		this.wall.fillPlaceMap(screenWorldMap)
	}


	/**
	 * 그림자 만들기 , 구 : make_shadow()
	 */
	make_shadow(player, level, comMode){
		if(comMode === VALUES.gameMode){
			this.makeShadowMap(player)
		} else if(comMode === VALUES.devMode){
			this.shadow.reset(VALUES.noShadow)
		}

		//this.shadow.setSight(player, level + 1)

		// 그림자 지도를 스크린에 표시한다.
		this.canvas.drawScreen(this.shadow.place, true, VALUES.shadowColor, VALUES.shadow)
	}

	/**
	 * 그림자 지도를 만든다 
	 * @param {PlayerMaker} player 
	 */
	makeShadowMap(player) {
		this.updateWallMap(player)
		this.shadow.reset(VALUES.shadow)
		this.shadow.chainSight(this.wall, player.screen_row, player.screen_col)
	}

	/**
	 * 전체 그리기 : 구 draw_place()
	 * 
	 * @param {PlayerMaker} player - 플레이어 
	 */
	drawCanvas(player, level, comMode) {
		// 플레이어 주변의 벽, 바닥 현재 상태 그리기
		this.canvas.drawScreen(this.getPlayerWorld(player), false)
		// 플레이어 그리기
		this.canvas.drawPlayer(player)
		// 캔버스 테두리 그리기
		this.canvas.drawBorder()
		// 그림자 그리기
		this.make_shadow(player, level, comMode)
	}

}

/**
 * 게임 플레이와 관련된 클래스
 */
class Game {
	constructor() {
		// 지도 변수 설정
		this.map = new MapMaker()
		// 플레이어 설정
		this.player = new PlayerMaker(this.map.player_screen_Y, this.map.player_screen_Y)
		// 기타 변수 초기화
		this.level = 0				// 게임 레벨
		this.moveLength = 0			// 이동 거리 저장
		this.levelInfo = this.map.levelMap.getInfo(this.level)
		this.exitInfo = this.exitPos()
		// 게임모드로 시작
		this.commandMode = VALUES.gameMode 

		// eventHandler에 this bind 
		this.timerWait = true		// 처음엔 타이머 대기 상태 
		this.timerId = null
		this.prevTime = undefined

		//움직임 정지용
		this.com_move
		this.mob_move

	}


	/**
	 * 게임 초기 설정을 한다 
	 * 레벨이 올라가면 지도크기가 커진다 
	 */
	startGame() {
		// 게임 지도를 만든다
		// 게임 레벨을 조정한다
		this.map.createWorld(this.levelInfo.width, this.levelInfo.height)
		this.map.setupLevelMap(this.level)
		this.map.drawCanvas(this.player, this.level, this.commandMode)

		// 이벤트를 처리한다
		this.move_computer()
		this.move_mobile()
		this.modeChange()

		// 게임 정보를 표시한
		this.displayInfo()
	}

	/**
	 * @typedef {Object} ExitPos
	 * @property {number} row - 월드 지도에서 출구 행 좌표 
	 * @property {number} col - 월드 지도에서 출구 열 좌표
	 * @property {boolean} onExit - 플레이어 위치와 출구 위치가 일치하면 true  
	 */
	/**
	 * 출구 위치 정보를 반환한다
	 * 
	 * @returns {ExitPos} - 출구 정보  
	 */
	exitPos() {
		const targetRow = this.player.screen_row + this.levelInfo.exitRow
		const targetCol = this.player.screen_col + this.levelInfo.exitCol
		return {
			row : targetRow,
			col : targetCol,
			onExit : (this.player.world_row === targetRow) &&
			         (this.player.world_col === targetCol)
		}
	}

	/**
	 * 출구에 도착하면 다음 레벨로 진행한다
	 * move_computer() 에서 실행된다
	 */
	nextLevel() {
		if (this.exitInfo.onExit) {
			// 출구 좌표에 도착하면 레벨을 올리고 변수 초기화
			this.level++
			this.levelInfo = this.map.levelMap.getInfo(this.level)
			if (this.levelInfo) {
				// 레벨이 남아있으면 다음 레벨로 진행 
				this.exitInfo = this.exitPos()
				this.player.reset()
				this.initTimer()
				this.map.createWorld(this.levelInfo.width, this.levelInfo.height)
				this.map.setupLevelMap(this.level)
				this.map.drawCanvas(this.player, this.level, this.commandMode)
			} else {
				// 더 이상 레벨이 없으므로 이동 키 입력 처리 해제 
				document.removeEventListener('keydown', this.com_move)
				clearInterval(this.mob_move)
			}
		}
	}

	/**
	 * key가 눌릴때 플레이어를 움직이는 콜백함수  
	 * @param {Event} event 
	 */
	moveCallback(direction) {
		this.moveLength = this.player.move(direction, this.map.world, this.moveLength)
		this.map.drawCanvas(this.player, this.level, this.commandMode)
		this.map.updateWallMap(this.player)
		this.exitInfo = this.exitPos()
		this.timerWait && this.startTimer()
		this.nextLevel()
		this.displayInfo()
	}

	/**
	 * 컴퓨터에서  플레이어 이동 처리 : 구 move_direction()
	 */
	move_computer() {
		document.addEventListener('keydown', this.com_move = (event)=>{
			const code = {
				ArrowUp: "up", ArrowDown: "down",
				ArrowRight: "right", ArrowLeft: "left"}
			const direction = code[event.key]
			if(direction) { this.moveCallback(direction) }
		})
	}

	/**
	 * 모바일에서 플레이어 이동 처리
	 * 
	 * 드래그로 이동
	 */
	move_mobile() {
		let clientFix = {x:0, y:0}	 // 처음 드래그 시작한 위치, 기준점 좌표 
		let clientMove = {x:0, y:0}		// 드래글하여 움직인 위칭, 이동 좌표

		// 터치 시작할 때  좌표값 저장 
		document.addEventListener('touchstart', (e)=>{
			clientFix.x = Math.round(e.touches[0].clientX)
			clientFix.y = Math.round(e.touches[0].clientY)
			clientMove.x = Math.round(e.touches[0].clientX)
			clientMove.y = Math.round(e.touches[0].clientY)
		})

		// 드래그할 때 움직인 곳 좌표값 저장
		document.addEventListener('touchmove',(e)=>{
			clientMove.x = Math.round(e.touches[0].clientX)
			clientMove.y = Math.round(e.touches[0].clientY)
		})
	
		// 터치 뗄 때 초기화
		document.addEventListener('touchend', ()=>{
			clientFix.x = 0
			clientFix.y = 0
			clientMove.x = 0
			clientMove.y = 0
		})

		this.mob_move=setInterval( () => {
			const xMove = Math.abs(clientFix.x - clientMove.x)
			const yMove = Math.abs(clientFix.y - clientMove.y)
			if(xMove > yMove && xMove > 15) {
				if( clientFix.x < clientMove.x ) { this.moveCallback("right") }
				else if ( clientFix.x > clientMove.x ){ this.moveCallback("left") }
			} else if(yMove > xMove && yMove > 15) { 
				if( clientFix.y < clientMove.y) { this.moveCallback("down") }
				else if( clientFix.y > clientMove.y) { this.moveCallback("up") }
			}
		}, 150)

	}

	/**
	 * 실행 모드를 토글 ( 게임모드 ◀ ▶  개발 모드) 한다
	 * 
	 * 기본값은 html에서 설정하며 "게임모드" 이다. 
	 * 
	 * 개발 모드 : 그림자가 사라진다. 
	 *             미로에서 벽을 넘어다닐수 있다.
	 * 게임 모드 : 플레이어가 게임을 하는 모드 
	 */
	modeChange() {
		const cmdButton = document.getElementById("command")
		cmdButton.addEventListener("click", () => {
			cmdButton.value = cmdButton.value === VALUES.devMode ? VALUES.gameMode : VALUES.devMode 
			this.commandMode = cmdButton.value
			this.map.drawCanvas(this.player, this.level, this.commandMode)
			this.map.devModeWall(this.level, this.commandMode)
			console.log(`${this.commandMode}`)
		})
	}

	/**
	 * 게임에 필요한 정보를 보여준다
	 */
	displayInfo() {
		// 출구의 월드지도 좌표 계산
		// 플레이어 현재 위치에서 출구까지의 거리를 계산해서 10을 곱함
		const displayArea = document.getElementById("usermode")
		if (this.levelInfo) {
			const distance10 = Math.round(Math.sqrt(Math.pow(this.exitInfo.row - this.player.world_row, 2) +
							Math.pow(this.exitInfo.col - this.player.world_col, 2)) * 10)
			displayArea.innerText = ` 진행 레벨 : ${this.level+1}`
			displayArea.innerText += `\n 출구 : ${this.exitInfo.row-9}, ${this.exitInfo.col-9}`
			displayArea.innerText += `\n현재위치 : ${this.player.world_col-9}, ${this.player.world_row-9}`
			displayArea.innerText += `\n 출구까지의 거리 : ${parseInt(distance10 / 10)}.${distance10 % 10}`
			displayArea.innerText += `\n 이동 거리 : ${this.moveLength}`
		} else {
			displayArea.innerText = '미션 완료 !! 축하합니다'
		}
	}

	/**
	 * 게임 진행 시간을 표시한다
	 */
	startTimer() {
		console.log('startTimer')
		const timer = document.getElementById("timer")
		this.prevTime = new Date()
		this.timerWait = false 
		this.timerID = setInterval(() => {
			const now = new Date()
			const diff = (now.getTime() - this.prevTime.getTime()) / 1000
			const mm = Math.floor(diff / 60).toString().padStart(2, '0')
			const ss = Math.floor(diff % 60).toString().padStart(2, '0')
			timer.innerText = `${mm} : ${ss}`
		}, 1000)
	}

	/**
	 * 타이머를 초기화 한다
	 */
	initTimer() {
		console.log('initTimer')
		document.getElementById("timer").innerText = '00 : 00'
		this.timerWait = true 
		clearInterval(this.timerID)
	}

}

const game = new Game()
game.startGame()
