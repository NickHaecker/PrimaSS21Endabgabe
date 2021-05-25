"use strict";
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    // const ChessFigures: string[] = [
    //     "Turm", "Springer", "Läufer", "Dame", "König", "Läufer", "Springer", "Turm", "Bauer", "Bauer", "Bauer", "Bauer", "Bauer", "Bauer", "Bauer", "Bauer"
    // ];
    // const Movements: Move
    const CHESSFIGUREMOVEMENTS = {
        "Turm": {
            _attack: null,
            _movement: [
                {
                    _fieldsX: 1,
                    _fieldsZ: 0,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: true
                }, {
                    _fieldsX: 0,
                    _fieldsZ: 1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: true
                }
            ]
        },
        "Springer": {
            _attack: null,
            _movement: [
                {
                    _fieldsX: 3,
                    _fieldsZ: 1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: true
                },
                {
                    _fieldsX: 3,
                    _fieldsZ: -1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: true
                }
            ]
        },
        "Läufer": {
            _attack: null,
            _movement: [
                {
                    _fieldsX: 1,
                    _fieldsZ: 1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: true
                },
                {
                    _fieldsX: 1,
                    _fieldsZ: -1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: true
                }
            ]
        },
        "Dame": {
            _attack: null,
            _movement: [
                {
                    _fieldsX: 1,
                    _fieldsZ: 0,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: true
                }, {
                    _fieldsX: 0,
                    _fieldsZ: 1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: true
                },
                {
                    _fieldsX: 1,
                    _fieldsZ: 1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: true
                },
                {
                    _fieldsX: 1,
                    _fieldsZ: -1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: true
                }
            ]
        },
        "König": {
            _attack: null,
            _movement: [
                {
                    _fieldsX: 1,
                    _fieldsZ: 0,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: false
                }, {
                    _fieldsX: 0,
                    _fieldsZ: 1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: false
                },
                {
                    _fieldsX: 1,
                    _fieldsZ: 1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: false
                },
                {
                    _fieldsX: 1,
                    _fieldsZ: -1,
                    _movementBackwards: true,
                    _initScale: false,
                    _scalable: false
                }
            ]
        },
        "Bauer": {
            _attack: [
                {
                    _fieldsX: 1,
                    _fieldsZ: 1,
                    _movementBackwards: false,
                    _scalable: true
                },
                {
                    _fieldsX: 1,
                    _fieldsZ: -1,
                    _movementBackwards: false,
                    _scalable: true
                }
            ],
            _movement: [
                {
                    _fieldsX: 1,
                    _fieldsZ: 0,
                    _movementBackwards: false,
                    _initScale: true,
                    _scalable: false
                }
            ]
        }
    };
    class ChessFigure extends ChessGame.GameObject {
        constructor(name, mass, pysicsType, colliderType, group, place, user) {
            super(name, mass, pysicsType, colliderType, group);
            this._place = place;
            this._user = user;
            this._move = CHESSFIGUREMOVEMENTS[name];
            console.log(this._move);
            let mesh = new f.MeshSphere;
            let componentMesh = new f.ComponentMesh(mesh);
            componentMesh.mtxPivot.scale(new f.Vector3(0.8, 2, 0.8));
            this.addComponent(componentMesh);
            let materialSolidWhite = new f.Material("Color", f.ShaderUniColor, new f.CoatColored(f.Color.CSS(user === ChessGame.UserType.PLAYER ? "Black" : "White")));
            let componentMaterial = new f.ComponentMaterial(materialSolidWhite);
            this.addComponent(componentMaterial);
            this.mtxLocal.translate(new f.Vector3(this._place.mtxLocal.translation.x, this._place.mtxLocal.translation.y + 1, this._place.mtxLocal.translation.z));
        }
        SetPlace(place) {
            this._place = place;
        }
        GetPlace() {
            return this._place;
        }
        MoveFigure(movementController) {
        }
        DeleteMovementController() {
        }
    }
    ChessGame.ChessFigure = ChessFigure;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=ChessFigure.js.map