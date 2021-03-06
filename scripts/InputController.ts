namespace ChessGame {
    import f = FudgeCore;

    export class InputController {
        private _places: f.Node[];
        private _player: ChessPlayers;
        private _cameraController: CameraController;
        private _currentPlayer: UserType;
        private _currentChessFigureIndex: number = 0;
        private _clickable: boolean = true;
        private _selectionControl: SelectionControl;
        private _movementIndex: number = 0;
        private _attackIndex: number = 0;
        private _selection: AvailableMovment;
        private _isMovement: boolean = true;
        private _isCheckmate: boolean = false;
        private _gameController: GameController;
        constructor(
            places: f.Node[],
            player: ChessPlayers,
            cameraController: CameraController,
            selectionControl: SelectionControl,
            user: UserType,
            gameController: GameController
        ) {
            this._selectionControl = selectionControl;
            this._places = places;
            this._player = player;
            this._cameraController = cameraController;
            this._currentPlayer = user;
            this._cameraController.UpdatePlayer(this._currentPlayer);
            this._gameController = gameController;
            this._selection = this.GetChessFigureMovements(
                this._currentPlayer,
                this._currentChessFigureIndex,
                this._isMovement
            );
        }
        public set Checkmate(value: boolean) {
            this._isCheckmate = value;
        }
        public get Checkmate(): boolean {
            return this._isCheckmate;
        }
        public UpdateCurrentUser(user: UserType): void {
            if (user !== this._currentPlayer) {
                this._cameraController.UpdatePlayer(user);
            }
            this._currentPlayer = user;
            this._selection = this.GetChessFigureMovements(
                this._currentPlayer,
                this._currentChessFigureIndex,
                this._isMovement
            );
        }
        public GetCurrentUser(): UserType {
            return this._currentPlayer;
        }

        public HandleInput(): void {
            this.HandleSelectionControl();
            this.HandleCameraPosition();
            if (this._currentPlayer === UserType.PLAYER) {
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.D])) {
                    this._currentChessFigureIndex++;
                    this.CheckIfValidIndex();
                    this.HandleSoundController(SoundType.SELECT_FIGURE);
                    this.PressTimerReset();
                }
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.A])) {
                    this._currentChessFigureIndex--;
                    this.CheckIfValidIndex();
                    this.HandleSoundController(SoundType.SELECT_FIGURE);
                    this.PressTimerReset();
                }
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.W])) {
                    if (this._isMovement) {
                        if (this._selection._movements.length > 0) {
                            this._movementIndex++;
                        }
                    } else {
                        if (this._selection._attacks.length > 0) {
                            this._attackIndex++;
                        }
                    }
                    this.CheckIfValidIndex();
                    this.HandleSoundController(SoundType.SELECT_FIELD);
                    this.SelectTimerReset();
                }
                if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.S])) {
                    if (this._isMovement) {
                        if (this._selection._movements.length > 0) {
                            this._movementIndex--;
                        }
                    } else {
                        if (this._selection._attacks.length > 0) {
                            this._attackIndex--;
                        }
                    }
                    this.CheckIfValidIndex();
                    this.HandleSoundController(SoundType.SELECT_FIELD);
                    this.SelectTimerReset();
                }
            } else {
                if (
                    this._clickable &&
                    f.Keyboard.isPressedOne([f.KEYBOARD_CODE.ARROW_RIGHT])
                ) {
                    this._currentChessFigureIndex++;
                    this.CheckIfValidIndex();
                    this.HandleSoundController(SoundType.SELECT_FIGURE);
                    this.PressTimerReset();
                }
                if (
                    this._clickable &&
                    f.Keyboard.isPressedOne([f.KEYBOARD_CODE.ARROW_LEFT])
                ) {
                    this._currentChessFigureIndex--;
                    this.CheckIfValidIndex();
                    this.HandleSoundController(SoundType.SELECT_FIGURE);
                    this.PressTimerReset();
                }
                if (
                    this._clickable &&
                    f.Keyboard.isPressedOne([f.KEYBOARD_CODE.ARROW_UP])
                ) {
                    if (this._isMovement) {
                        if (this._selection._movements.length > 0) {
                            this._movementIndex++;
                        }
                    } else {
                        if (this._selection._attacks.length > 0) {
                            this._attackIndex++;
                        }
                    }
                    this.CheckIfValidIndex();
                    this.HandleSoundController(SoundType.SELECT_FIELD);
                    this.SelectTimerReset();
                }
                if (
                    this._clickable &&
                    f.Keyboard.isPressedOne([f.KEYBOARD_CODE.ARROW_DOWN])
                ) {
                    if (this._isMovement) {
                        if (this._selection._movements.length > 0) {
                            this._movementIndex--;
                        }
                    } else {
                        if (this._selection._attacks.length > 0) {
                            this._attackIndex--;
                        }
                    }
                    this.CheckIfValidIndex();
                    this.HandleSoundController(SoundType.SELECT_FIELD);
                    this.SelectTimerReset();
                }
            }

            if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.Q])) {
                this._isMovement = !this._isMovement;
                this.PressTimerReset();
            }
            if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.E])) {
                this._isMovement = !this._isMovement;
                this.PressTimerReset();
            }
            if (this._clickable && f.Keyboard.isPressedOne([f.KEYBOARD_CODE.ENTER])) {
                this.Move();
                this.SelectTimerReset();
                setTimeout(
                        (ref: f.Node) => {
                            // this._selectionFinished = true;
                            this._gameController.HandleFinishMove();
                            this._currentChessFigureIndex = 0;
                            this._attackIndex = 0;
                            ref.getComponent(MovementController).EndMovement();
                        },
                        1200,
                        this._player[this._currentPlayer].GetFigures()[
                        this._currentChessFigureIndex
                        ]
                    );
            }
            this.ShowSelection();
        }
        public GetChessFigureMovements(
            currentPlayer: UserType,
            chessFigureIndex: number,
            isMovement: boolean = this._isMovement
        ): AvailableMovment {
            const POSSIBLEMOVEMENTS: f.ComponentTransform[] = [];
            const POSSIBLEATTACKS: f.ComponentTransform[] = [];
            let direction: number = 1;
            switch (currentPlayer) {
                case UserType.PLAYER:
                    direction = 1;
                    break;
                default:
                    direction = -1;
                    break;
            }
            const currentChessFigure: ChessFigure = this._player[
                currentPlayer
            ].GetFigures()[chessFigureIndex] as ChessFigure;
            const chessPlayerSetting: ChessPlayerSetting =
                currentChessFigure.GetChessFigureMovement();
            const currentPlaceTransform: f.ComponentTransform = currentChessFigure
                .GetPlace()
                .getComponent(f.ComponentTransform);
            const currentPlace: f.Vector3 =
                currentPlaceTransform.mtxLocal.translation;
            if (chessPlayerSetting != undefined) {
                if (isMovement) {
                    for (const movement of chessPlayerSetting._movement) {
                        if (!movement._scalable) {
                            if (movement._initScale) {
                                for (let i: number = 1; i < 3; i++) {
                                    const targetPosition: f.Vector3 = new f.Vector3(
                                        Round(
                                            direction * i * movement._fieldsX + currentPlace.x,
                                            10
                                        ),
                                        0,
                                        Round(
                                            direction * i * movement._fieldsZ + currentPlace.z,
                                            10
                                        )
                                    );
                                    for (const place of this._places) {
                                        const placeTrans: f.ComponentTransform = place.getComponent(
                                            f.ComponentTransform
                                        );
                                        if (
                                            Round(placeTrans.mtxLocal.translation.x, 10) ===
                                            targetPosition.x &&
                                            Round(placeTrans.mtxLocal.translation.z, 10) ===
                                            targetPosition.z
                                        ) {
                                            const placeController: PlaceController =
                                                place.getComponent(PlaceController);
                                            if (placeController.IsChessFigureNull()) {
                                                POSSIBLEMOVEMENTS.push(placeTrans);
                                            }
                                            if (!placeController.IsChessFigureNull()) {
                                                if (
                                                    placeController
                                                        .GetChessFigure()
                                                        .GetUser()
                                                        .GetPlayerType() !== currentPlayer
                                                ) {
                                                    POSSIBLEMOVEMENTS.push(placeTrans);
                                                }
                                            }
                                        }
                                    }
                                }
                            } else {
                                const targetPosition: f.Vector3 = new f.Vector3(
                                    Round(direction * movement._fieldsX + currentPlace.x, 10),
                                    0,
                                    Round(direction * movement._fieldsZ + currentPlace.z, 10)
                                );
                                for (const place of this._places) {
                                    const placeTrans: f.ComponentTransform = place.getComponent(
                                        f.ComponentTransform
                                    );
                                    if (
                                        Round(placeTrans.mtxLocal.translation.x, 10) ===
                                        targetPosition.x &&
                                        Round(placeTrans.mtxLocal.translation.z, 10) ===
                                        targetPosition.z
                                    ) {
                                        const placeController: PlaceController =
                                            place.getComponent(PlaceController);
                                        if (
                                            !placeController.IsChessFigureNull() &&
                                            currentChessFigure.name !== "Bauer"
                                        ) {
                                            if (
                                                placeController
                                                    .GetChessFigure()
                                                    .GetUser()
                                                    .GetPlayerType() !== currentPlayer
                                            ) {
                                                POSSIBLEMOVEMENTS.push(placeTrans);
                                            }
                                        }
                                        if (placeController.IsChessFigureNull()) {
                                            POSSIBLEMOVEMENTS.push(placeTrans);
                                        }
                                    }
                                }
                            }
                        } else {
                            let lastFieldReached: boolean = false;
                            let scale: number = 1;
                            while (!lastFieldReached) {
                                const targetPosition: f.Vector3 = new f.Vector3(
                                    Round(
                                        direction * scale * movement._fieldsX + currentPlace.x,
                                        10
                                    ),
                                    0,
                                    Round(
                                        direction * scale * movement._fieldsZ + currentPlace.z,
                                        10
                                    )
                                );
                                let hit: boolean = false;
                                for (const place of this._places) {
                                    const placeTransform: f.ComponentTransform =
                                        place.getComponent(f.ComponentTransform);
                                    if (
                                        Round(placeTransform.mtxLocal.translation.x, 10) ===
                                        targetPosition.x &&
                                        Round(placeTransform.mtxLocal.translation.z, 10) ===
                                        targetPosition.z
                                    ) {
                                        hit = true;
                                    }
                                }
                                if (!hit) {
                                    lastFieldReached = true;
                                } else {
                                    for (const place of this._places) {
                                        const placeTransform: f.ComponentTransform =
                                            place.getComponent(f.ComponentTransform);
                                        if (
                                            Round(placeTransform.mtxLocal.translation.x, 10) ===
                                            targetPosition.x &&
                                            Round(placeTransform.mtxLocal.translation.z, 10) ===
                                            targetPosition.z
                                        ) {
                                            const placeController: PlaceController =
                                                place.getComponent(PlaceController);
                                            if (!placeController.IsChessFigureNull()) {
                                                if (
                                                    placeController
                                                        .GetChessFigure()
                                                        .GetUser()
                                                        .GetPlayerType() !== currentPlayer
                                                ) {
                                                    POSSIBLEMOVEMENTS.push(placeTransform);
                                                }
                                                lastFieldReached = true;
                                                break;
                                            }
                                            if (placeController.IsChessFigureNull()) {
                                                POSSIBLEMOVEMENTS.push(placeTransform);
                                            }
                                        }
                                    }
                                }
                                scale++;
                            }
                        }
                    }
                } else {
                    if (chessPlayerSetting._attack !== null) {
                        for (const attack of chessPlayerSetting._attack) {
                            const targetPosition: f.Vector3 = new f.Vector3(
                                Round(direction * attack._fieldsX + currentPlace.x, 10),
                                0,
                                Round(direction * attack._fieldsZ + currentPlace.z, 10)
                            );
                            for (const place of this._places) {
                                const placeTrans: f.ComponentTransform = place.getComponent(
                                    f.ComponentTransform
                                );
                                if (
                                    Round(placeTrans.mtxLocal.translation.x, 10) ===
                                    targetPosition.x &&
                                    Round(placeTrans.mtxLocal.translation.z, 10) ===
                                    targetPosition.z
                                ) {
                                    const placeController: PlaceController =
                                        place.getComponent(PlaceController);
                                    if (!placeController.IsChessFigureNull()) {
                                        if (
                                            placeController
                                                .GetChessFigure()
                                                .GetUser()
                                                .GetPlayerType() !== currentPlayer
                                        ) {
                                            POSSIBLEATTACKS.push(placeTrans);
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        this._isMovement = true;
                    }
                }
            }
            return {
                _movements: POSSIBLEMOVEMENTS,
                _attacks: POSSIBLEATTACKS
            };
        }
        private Move(): void {
            const movementController: MovementController = new MovementController();
            const currentFigure: f.Node =
                this._player[this._currentPlayer].GetFigures()[
                this._currentChessFigureIndex
                ];
            let currentMove: f.ComponentTransform;
            if (this._isMovement) {
                if (this._selection._movements.length > 0) {
                    currentMove = this._selection._movements[this._movementIndex];
                }
            } else {
                if (this._selection._attacks.length > 0) {
                    currentMove = this._selection._attacks[this._attackIndex];
                }
            }
            if (currentMove) {
                movementController.Init(currentMove, this._places, currentFigure.name);
                currentFigure.addComponent(movementController);
            }
        }
        private HandleSoundController(soundType: SoundType): void {
            const index: number = this._currentChessFigureIndex;
            const soundController: SoundController = new SoundController(soundType);
            this._player[this._currentPlayer]
                .GetFigures()
            [index].addComponent(soundController);
        }
        private HandleSelectionControl(): void {
            gameState.player = this._player[this._currentPlayer].name;
            if (
                this._player[this._currentPlayer].GetFigures()[
                this._currentChessFigureIndex
                ]
            ) {
                const _currentFigure: ChessFigure = this._player[
                    this._currentPlayer
                ].GetFigures()[this._currentChessFigureIndex] as ChessFigure;
                const _currentPlace: f.Node = _currentFigure.GetPlace();
                const v3: f.Vector3 = new f.Vector3(
                    _currentPlace.mtxLocal.translation.x,
                    3,
                    _currentPlace.mtxLocal.translation.z
                );
                this._selectionControl.mtxLocal.translation = v3;
            }
        }
        private CheckIfValidIndex(): void {
            if (
                this._currentChessFigureIndex >
                this._player[this._currentPlayer].GetFigures().length - 1
            ) {
                this._currentChessFigureIndex = 0;
            }
            if (this._currentChessFigureIndex < 0) {
                this._currentChessFigureIndex =
                    this._player[this._currentPlayer].GetFigures().length - 1;
            }

            if (this._movementIndex > this._selection._movements.length - 1) {
                this._movementIndex = 0;
            }
            if (this._movementIndex < 0) {
                this._movementIndex = this._selection._movements.length - 1;
            }
            if (this._attackIndex > this._selection._attacks.length - 1) {
                this._attackIndex = 0;
            }
            if (this._attackIndex < 0) {
                this._attackIndex = this._selection._attacks.length - 1;
            }
        }
        private HandleCameraPosition(): void {
            const _currentFigure: ChessFigure = this._player[
                this._currentPlayer
            ].GetFigures()[this._currentChessFigureIndex] as ChessFigure;
            const _transform: f.ComponentTransform = _currentFigure.getComponent(
                f.ComponentTransform
            );
            this._cameraController.UpdatePosition(_transform);
        }
        private ShowSelection(): void {
            if (this._isMovement) {
                if (this._movementIndex < this._selection._movements.length) {
                    const currentMovementPosition: f.Node =
                        this._selection._movements[this._movementIndex].getContainer();
                    const transform: f.ComponentTransform =
                        currentMovementPosition.getComponent(f.ComponentTransform);
                    this._cameraController.UpdatePosition(transform);
                    currentMovementPosition.addChild(new MovementSelection());
                }
            } else {
                if (this._attackIndex < this._selection._attacks.length) {
                    const currentAttackPosition: f.Node =
                        this._selection._attacks[this._attackIndex].getContainer();
                    const transform: f.ComponentTransform =
                        currentAttackPosition.getComponent(f.ComponentTransform);
                    this._cameraController.UpdatePosition(transform);
                    currentAttackPosition.addChild(new MovementSelection());
                }
            }
        }
        private PressTimerReset(): void {
            this._selection = this.GetChessFigureMovements(
                this._currentPlayer,
                this._currentChessFigureIndex,
                this._isMovement
            );
            this._movementIndex = 0;
            this._clickable = false;
            f.Time.game.setTimer(500, 1, () => (this._clickable = true));
        }
        private SelectTimerReset(): void {
            this._clickable = false;
            f.Time.game.setTimer(500, 1, () => (this._clickable = true));
        }
    }
}
