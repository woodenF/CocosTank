import LinkedMap from '../Unit/LinkedMap';
// Learn TypeScript:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/typescript/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class BattleCtrl extends cc.Component {
    @property(cc.Prefab)
    private wall_column_1: cc.Prefab = null;
    @property(cc.Prefab)
    private wall_row_1: cc.Prefab = null;
    @property(cc.Prefab)
    private wall_column_2: cc.Prefab = null;
    @property(cc.Prefab)
    private wall_row_2: cc.Prefab = null;
    @property(cc.Prefab)
    private wall_column_3: cc.Prefab = null;
    @property(cc.Prefab)
    private wall_row_3: cc.Prefab = null;
    @property(cc.Node)
    private BattleRegion: cc.Node = null;
    @property(cc.Node)
    private TopCell: cc.Node = null;
    @property(cc.Node)
    private BottomCell: cc.Node = null;
    @property(cc.Node)
    private LeftCell: cc.Node = null;
    @property(cc.Node)
    private RightCell: cc.Node = null;
    @property(cc.Prefab)
    private player1: cc.Prefab = null;
    @property(cc.Prefab)
    private player2: cc.Prefab = null;
    @property(cc.SpriteFrame)
    private fllower_1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private fllower_2: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private fllower_3: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private horn_1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private horn_2: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private horn_3: cc.SpriteFrame = null;
    // 战斗数据
    private battleData = [
        { row: 3, column: 7, scale: 1 },
        { row: 4, column: 9, scale: 0.775 },
        { row: 5, column: 11, scale: 0.645 },
        { row: 6, column: 13, scale: 0.539 },
        { row: 7, column: 15, scale: 0.484 }
    ]
    private activeBattleData = null;
    private cells = 0;
    private externalResources = [];
    private activeExternalData = null;
    private linkedMap = {};
    private player = []
    start() {
        this.initBattleData();
    }
    initBattleData() {
        this.externalResources = [
            { cellColumn: this.wall_column_1, cellRow: this.wall_row_1, flower: this.fllower_1, horn: this.horn_1, bg: 'floor_1' },
            { cellColumn: this.wall_column_2, cellRow: this.wall_row_2, flower: this.fllower_2, horn: this.horn_2, bg: 'floor_2' },
            { cellColumn: this.wall_column_3, cellRow: this.wall_row_3, flower: this.fllower_3, horn: this.horn_3, bg: 'floor_3' },
        ]
        // 地图尺寸随机
        var random = Math.random() * this.battleData.length >> 0;
        this.activeBattleData = this.battleData[random]
        // 地图修饰随机
        random = Math.random() * this.externalResources.length >> 0;
        this.activeExternalData = this.externalResources[random];
        this.cells = this.activeBattleData.column * this.activeBattleData.row
        this.initPlayerPoint();
        this.linkedMap = new LinkedMap(this.activeBattleData.column, this.activeBattleData.row, this.player[0], this.player[1]).generate();
        this.externalCell();
        for (let i = 0; i < this.cells; i++) {
            this.generateRegion(i)
        }
    }
    // 双方玩家位置随机
    initPlayerPoint() {
        this.player = [];
        this.player.push(Math.random() * this.cells >> 0);
        this.player.push(Math.random() * this.cells >> 0);
        if (this.player[0] === this.player[1]) {
            this.initPlayerPoint()
        }
    }
    // 设置墙属性
    setCellData(type, scale) {
        if (type === 0) {
            var node = cc.instantiate(this.activeExternalData.cellColumn);
            node.scale = scale;
            return node;
        } else {
            var node = cc.instantiate(this.activeExternalData.cellRow);
            node.scale = scale;
            return node;
        }
    }
    setHornData(scale, rotation) {
        var horn = new cc.Node();
        horn.addComponent(cc.Sprite).spriteFrame = this.activeExternalData.horn;
        horn.scale = scale;
        horn.rotation = rotation;
        return horn;
    }
    setFlowerData(scale, rotation) {
        var flower = new cc.Node();
        flower.addComponent(cc.Sprite).spriteFrame = this.activeExternalData.flower;
        flower.scale = scale;
        flower.rotation = rotation;
        return flower;
    }
    /**
     * 生成外部墙体
     */
    externalCell() {
        var self = this;
        cc.loader.loadRes(self.activeExternalData.bg, cc.SpriteFrame, function (err, spriteFrame) {
            self.BattleRegion.getComponent(cc.Sprite).spriteFrame = spriteFrame
        })
        // 计算图片缩放比，0.8814为不算阴影的图片墙体实际比例，此处将该实体墙比例作为1比例计算
        var externalCellWidth = this.TopCell.width / this.activeBattleData.column
        var scale = externalCellWidth / 194 / 0.8814;
        for (let i = 0; i < this.activeBattleData.column; i++) {
            var node = this.setCellData(0, scale);
            node.setPosition(externalCellWidth * i - this.BottomCell.width / 2 + externalCellWidth / 2, 0);
            this.BottomCell.addChild(node);
            var horn_1 = this.setHornData(scale, 180);
            horn_1.setPosition(-this.BottomCell.width / 2 - horn_1.width * scale / 6, -horn_1.height * scale / 3.5);
            this.BottomCell.addChild(horn_1);
            horn_1 = this.setHornData(scale, 90);
            horn_1.setPosition(this.BottomCell.width / 2 + horn_1.width * scale / 1.5, -horn_1.height * scale / 3.5);
            this.BottomCell.addChild(horn_1);
            var flower = this.setFlowerData(scale, 180);
            flower.setPosition(externalCellWidth * i - this.BottomCell.width / 2 + externalCellWidth / 2 + 10 * scale, -flower.height * scale / 2);
            this.BottomCell.addChild(flower);
            horn_1 = this.setHornData(scale, 270);
            horn_1.setPosition(-this.TopCell.width / 2 - horn_1.width * scale / 5, horn_1.height * scale / 2);
            this.TopCell.addChild(horn_1);
            horn_1 = this.setHornData(scale, 0);
            horn_1.setPosition(this.TopCell.width / 2 + horn_1.width * scale / 1.7, horn_1.height * scale / 2);
            this.TopCell.addChild(horn_1);
            node = this.setCellData(0, scale);
            node.setPosition(externalCellWidth * i - this.TopCell.width / 2 + externalCellWidth / 2, 0)
            this.TopCell.addChild(node);
            flower = this.setFlowerData(scale, 0);
            flower.setPosition(externalCellWidth * i - this.TopCell.width / 2 + externalCellWidth / 2 + 10 * scale, flower.height * scale / 2 + node.height * scale / 2);
            this.TopCell.addChild(flower);

        }
        var externalCellHeigth = this.LeftCell.height / this.activeBattleData.row;
        scale = externalCellHeigth / 194 / 0.88;
        for (let i = 0; i < this.activeBattleData.row; i++) {
            var flower = this.setFlowerData(scale, 270);
            flower.setPosition(-flower.height * scale / 2 + 0.5, externalCellHeigth * i - this.LeftCell.height / 2 + externalCellHeigth / 2 + 12 * scale);
            this.LeftCell.addChild(flower);
            var node = this.setCellData(1, scale);
            node.setPosition(0, externalCellHeigth * i - this.LeftCell.height / 2 + externalCellHeigth / 2);
            this.LeftCell.addChild(node);
            node = this.setCellData(1, scale);
            node.setPosition(0, externalCellHeigth * i - this.RightCell.height / 2 + externalCellHeigth / 2);
            this.RightCell.addChild(node);
            flower = this.setFlowerData(scale, 90);
            flower.setPosition((flower.height * scale / 2 + node.width * scale / 2), externalCellHeigth * i - this.RightCell.height / 2 + externalCellHeigth / 2 + 11 * scale);
            this.RightCell.addChild(flower);
        }
    }
    /**
     * 内部资源生成
     * @param i 
     */
    generateRegion(i) {
        var probability = 0.9;
        var row = i / this.activeBattleData.column >> 0,
            column = i % this.activeBattleData.column;
        var layoutNode = new cc.Node('layoutNode');
        var cellWidth = Math.floor((this.BattleRegion.width / this.activeBattleData.column) * 100) / 100;
        var cellHeight = this.BattleRegion.height / this.activeBattleData.row
        layoutNode.addComponent(cc.Layout);
        layoutNode.setContentSize(cellWidth, cellHeight);
        this.BattleRegion.addChild(layoutNode);
        var layoutData = layoutNode.getBoundingBox();
        console.log(layoutData)
        // 右边的墙
        if (column !== this.activeBattleData.column - 1 && (!this.linkedMap[i] || this.linkedMap[i].indexOf(i + 1) < 0) && Math.random() < probability) {
            var scale = cellHeight / 194 / 0.8814;
            var rightCell = cc.instantiate(this.activeExternalData.cellRow);
            layoutNode.addChild(rightCell);
            rightCell.scale = scale;
            rightCell.setPosition(this.BattleRegion.width / this.activeBattleData.column * (column + 1), -rightCell.height * scale / 2 - (row * rightCell.height * scale) + (rightCell.height * scale * 0.1185) * row + 10 * scale)
        }
        // 下边的墙
        if (row !== this.activeBattleData.row - 1 && (!this.linkedMap[i] || this.linkedMap[i].indexOf(i + this.activeBattleData.column) < 0) && Math.random() < probability) {
            var scale = cellWidth / 194 / 0.8814;
            var bottomCell = cc.instantiate(this.activeExternalData.cellColumn);
            layoutNode.addChild(bottomCell);
            bottomCell.scale = scale;
            bottomCell.setPosition(this.BattleRegion.width / this.activeBattleData.column * (column + 1) - bottomCell.width * scale / 2 + 7 * scale, -this.BattleRegion.height / this.activeBattleData.row * (row + 1))
        }
        if (i === this.player[0]) {
            var player1 = cc.instantiate(this.player1);
            player1.scale = this.activeBattleData.scale;
            player1.rotation = Math.random() * 180 >> 0;
            player1.setPosition(this.BattleRegion.width / this.activeBattleData.column * column + this.BattleRegion.width / this.activeBattleData.column / 2, - this.BattleRegion.height / this.activeBattleData.row * row - this.BattleRegion.height / this.activeBattleData.row / 2);
            layoutNode.addChild(player1);
        }
        if (i === this.player[1]) {
            var player2 = cc.instantiate(this.player2);
            player2.scale = this.activeBattleData.scale;
            player2.rotation = Math.random() * 180 >> 0;
            player2.setPosition(0, 0);
            layoutNode.addChild(player2);
        }
    }
}