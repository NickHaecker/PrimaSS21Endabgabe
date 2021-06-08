namespace ChessGame {
    import f = FudgeCore;
    export class ChessFigure extends GameObject {
        private _place: f.Node;
        private _user: UserType;
        private _move: ChessPlayerSetting;
        constructor(name: string, mass: number, pysicsType: f.PHYSICS_TYPE, colliderType: f.COLLIDER_TYPE, group: f.PHYSICS_GROUP, place: f.Node, user: UserType) {
            super(name, mass, pysicsType, colliderType, group, new f.MeshSphere);
            this._place = place;
            this._user = user;

            let posY: number = 0;
            let componentMesh: f.ComponentMesh = this.getComponent(f.ComponentMesh);
            if (name === "Bauer") {
                posY = this._place.mtxLocal.translation.y + 0.5;
                componentMesh.mtxPivot.scale(new f.Vector3(0.8, 1, 0.8));
            } else {
                posY = this._place.mtxLocal.translation.y + 1;
                componentMesh.mtxPivot.scale(new f.Vector3(0.8, 2, 0.8));
            }

            let materialSolidWhite: f.Material = new f.Material("Color", f.ShaderUniColor, new f.CoatColored(f.Color.CSS(user === UserType.PLAYER ? "Black" : "White")));
            let componentMaterial: f.ComponentMaterial = new f.ComponentMaterial(materialSolidWhite);
            this.addComponent(componentMaterial);

            this.mtxLocal.translate(new f.Vector3(this._place.mtxLocal.translation.x, posY, this._place.mtxLocal.translation.z));
            this.HandleMoveData(name);
        }
        public SetPlace(place: f.Node): void {
            this._place = place;
        }
        public GetPlace(): f.Node {
            return this._place;
        }
        public MoveFigure(movementController: MovementController): void {
            this.addComponent(movementController);
        }
        public DeleteMovementController(): void {
            console.log();
        }
        public GetChessFigureMovement(): ChessPlayerSetting {
            return this._move;
        }
        public UpdateInitScale(): void {
            this._move._movement[0]._initScale = false;
        }
        public GetUser(): UserType {
            return this._user;
        }
        private async HandleMoveData(name: string): Promise<void> {
            this._move = await DataController.Instance.GetMovementData(name);
        }
    }
}