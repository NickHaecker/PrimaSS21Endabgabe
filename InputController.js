"use strict";
var ChessGame;
(function (ChessGame) {
    var f = FudgeCore;
    class InputController {
        constructor(places, player, cameraController, maxTime, selectionControl) {
            this._currentUseTime = 0;
            this._currentPlayer = ChessGame.UserType.PLAYER;
            this._break = false;
            this._currentChessFigureIndex = 0;
            this._clickable = true;
            this._movementIndex = 0;
            this.x = 0;
            this._selectionControl = selectionControl;
            this._places = places;
            this._player = player;
            this._cameraController = cameraController;
            this._userTimer = {
                player: { _usedTime: maxTime },
                enemy: { _usedTime: maxTime }
            };
            this._maxTime = maxTime;
            // this._currentChessFigureIndex.
            // this.HandleEvents();
        }
        HandleInput() {
            this.HandleSelectionControl();
            this.UpdateTimer();
            this.HandleCameraPosition();
            if (this._currentPlayer === ChessGame.UserType.PLAYER) {
                if (this._clickable && ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D])) {
                    this._currentChessFigureIndex++;
                    this.CheckIfValidIndex();
                    // console.log(this._currentChessFigureIndex);
                    this.HandleSoundController(ChessGame.SoundType.SELECT_CHESSFIGURE);
                    this._clickable = false;
                    ƒ.Time.game.setTimer(500, 1, () => this._clickable = true);
                }
                if (this._clickable && ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A])) {
                    this._currentChessFigureIndex--;
                    this.CheckIfValidIndex();
                    // console.log(this._currentChessFigureIndex);
                    this.HandleSoundController(ChessGame.SoundType.SELECT_CHESSFIGURE);
                    this._clickable = false;
                    ƒ.Time.game.setTimer(500, 1, () => this._clickable = true);
                }
            }
            else {
                console.log();
            }
            this.GetChessFigureMovements();
        }
        ResetTimer() {
            this._userTimer = {
                player: { _usedTime: this._maxTime },
                enemy: { _usedTime: this._maxTime }
            };
            this._currentUseTime = 0;
        }
        HandleSoundController(soundType) {
            const index = this._currentChessFigureIndex;
            let soundFile = "";
            switch (soundType) {
                case ChessGame.SoundType.SELECT_CHESSFIGURE:
                    soundFile = "Beat";
                    break;
                default:
                    soundFile = "Ufo";
                    break;
            }
            const soundController = new ChessGame.SoundController(soundFile);
            this._player[this._currentPlayer].getChildren()[index].addComponent(soundController);
        }
        HandleSelectionControl() {
            if (this._player[this._currentPlayer].getChildren()[this._currentChessFigureIndex]) {
                const _currentFigure = this._player[this._currentPlayer].getChildren()[this._currentChessFigureIndex];
                const _currentPlace = _currentFigure.GetPlace();
                const v3 = new f.Vector3(_currentPlace.mtxLocal.translation.x, 3, _currentPlace.mtxLocal.translation.z);
                this._selectionControl.mtxLocal.translation = v3;
            }
        }
        CheckIfValidIndex() {
            if (this._currentChessFigureIndex > this._player[this._currentPlayer].getChildren().length - 1) {
                this._currentChessFigureIndex = 0;
            }
            if (this._currentChessFigureIndex < 0) {
                this._currentChessFigureIndex = this._player[this._currentPlayer].getChildren().length - 1;
            }
        }
        UpdateTimer() {
            if (!this._break) {
                this._currentUseTime++;
                ChessGame.gameState.currentTime = this._currentUseTime;
            }
            // this._userTimer[this._currentPlayer]._usedTime++:
            // this._currentUseTime++;
            // console.log(this._timer)
            // gameState.time = this._timer;
        }
        SwitchPlayerTimer() {
            const t = this._currentUseTime;
            const r = this._userTimer[this._currentPlayer]._usedTime;
            this._userTimer[this._currentPlayer]._usedTime = r - t;
            this._currentUseTime = 0;
            this._currentChessFigureIndex = 0;
            this._cameraController.UpdatePlayer(this._currentPlayer);
        }
        HandleCameraPosition() {
            const _currentFigure = this._player[this._currentPlayer].getChildren()[this._currentChessFigureIndex];
            const _transform = _currentFigure.getComponent(f.ComponentTransform);
            this._cameraController.UpdatePosition(_transform);
        }
        GetChessFigureMovements() {
            const currentChessFigure = this._player[this._currentPlayer].getChildren()[this._currentChessFigureIndex];
            const chessPlayerSetting = currentChessFigure.GetChessFigureMovement();
            if (this.x === 0) {
                console.log(chessPlayerSetting);
                this.x++;
            }
        }
    }
    ChessGame.InputController = InputController;
})(ChessGame || (ChessGame = {}));
//# sourceMappingURL=InputController.js.map