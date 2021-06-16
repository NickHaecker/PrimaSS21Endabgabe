"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
       * A physical connection between two bodies with a defined axe movement.
       * Used to create a sliding joint along one axis. Two RigidBodies need to be defined to use it.
       * A motor can be defined to move the connected along the defined axis. Great to construct standard springs or physical sliders.
       *
       * ```plaintext
       *          JointHolder - attachedRigidbody
       *                    --------
       *                    |      |
       *          <---------|      |--------------> connectedRigidbody, sliding on one Axis, 1 Degree of Freedom
       *                    |      |
       *                    --------
       * ```
       * @author Marko Fehrenbach, HFU 2020
       */
    class ComponentJointPrismatic extends FudgeCore.ComponentJoint {
        /** Creating a prismatic joint between two ComponentRigidbodies only moving on one axis bound on a local anchorpoint. */
        constructor(_attachedRigidbody = null, _connectedRigidbody = null, _axis = new FudgeCore.Vector3(0, 1, 0), _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_attachedRigidbody, _connectedRigidbody);
            //Internally used variables - Joint Properties that are used even when no actual oimoJoint is currently existend
            this.jointSpringDampingRatio = 0;
            this.jointSpringFrequency = 0;
            this.jointMotorLimitUpper = 10;
            this.jointMotorLimitLower = -10;
            this.jointMotorForce = 0;
            this.jointMotorSpeed = 0;
            this.jointBreakForce = 0;
            this.jointBreakTorque = 0;
            this.config = new OIMO.PrismaticJointConfig();
            this.jointAxis = new OIMO.Vec3(_axis.x, _axis.y, _axis.z);
            this.jointAnchor = new OIMO.Vec3(_localAnchor.x, _localAnchor.y, _localAnchor.z);
            /*Tell the physics that there is a new joint and on the physics start the actual joint is first created. Values can be set but the
              actual constraint ain't existent until the game starts
            */
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.dirtyStatus);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.superRemove);
        }
        //#region Get/Set transfor of fudge properties to the physics engine
        /**
         * The axis connecting the the two [[Node]]s e.g. Vector3(0,1,0) to have a upward connection.
         *  When changed after initialization the joint needs to be reconnected.
         */
        get axis() {
            return new FudgeCore.Vector3(this.jointAxis.x, this.jointAxis.y, this.jointAxis.z);
        }
        set axis(_value) {
            this.jointAxis = new OIMO.Vec3(_value.x, _value.y, _value.z);
            this.disconnect();
            this.dirtyStatus();
        }
        /**
         * The exact position where the two [[Node]]s are connected. When changed after initialization the joint needs to be reconnected.
         */
        get anchor() {
            return new FudgeCore.Vector3(this.jointAnchor.x, this.jointAnchor.y, this.jointAnchor.z);
        }
        set anchor(_value) {
            this.jointAnchor = new OIMO.Vec3(_value.x, _value.y, _value.z);
            this.disconnect();
            this.dirtyStatus();
        }
        /**
         * The damping of the spring. 1 equals completly damped.
         */
        get springDamping() {
            return this.jointSpringDampingRatio;
        }
        set springDamping(_value) {
            this.jointSpringDampingRatio = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getSpringDamper().dampingRatio = this.jointSpringDampingRatio;
        }
        /**
         * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
        */
        get springFrequency() {
            return this.jointSpringFrequency;
        }
        set springFrequency(_value) {
            this.jointSpringFrequency = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getSpringDamper().frequency = this.jointSpringFrequency;
        }
        /**
         * The amount of force needed to break the JOINT, in Newton. 0 equals unbreakable (default)
        */
        get breakForce() {
            return this.jointBreakForce;
        }
        set breakForce(_value) {
            this.jointBreakForce = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.setBreakForce(this.jointBreakForce);
        }
        /**
           * The amount of force needed to break the JOINT, while rotating, in Newton. 0 equals unbreakable (default)
          */
        get breakTorque() {
            return this.jointBreakTorque;
        }
        set breakTorque(_value) {
            this.jointBreakTorque = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.setBreakTorque(this.jointBreakTorque);
        }
        /**
          * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit.
         */
        get motorLimitUpper() {
            return this.jointMotorLimitUpper;
        }
        set motorLimitUpper(_value) {
            this.jointMotorLimitUpper = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getLimitMotor().upperLimit = this.jointMotorLimitUpper;
        }
        /**
          * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit.
         */
        get motorLimitLower() {
            return this.jointMotorLimitLower;
        }
        set motorLimitLower(_value) {
            this.jointMotorLimitLower = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getLimitMotor().lowerLimit = this.jointMotorLimitLower;
        }
        /**
          * The target speed of the motor in m/s.
         */
        get motorSpeed() {
            return this.jointMotorSpeed;
        }
        set motorSpeed(_value) {
            this.jointMotorSpeed = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getLimitMotor().motorSpeed = this.jointMotorSpeed;
        }
        /**
          * The maximum motor force in Newton. force <= 0 equals disabled. This is the force that the motor is using to hold the position, or reach it if a motorSpeed is defined.
         */
        get motorForce() {
            return this.jointMotorForce;
        }
        set motorForce(_value) {
            this.jointMotorForce = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getLimitMotor().motorForce = this.jointMotorForce;
        }
        /**
          * If the two connected RigidBodies collide with eath other. (Default = false)
         */
        get internalCollision() {
            return this.jointInternalCollision;
        }
        set internalCollision(_value) {
            this.jointInternalCollision = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.setAllowCollision(this.jointInternalCollision);
        }
        //#endregion
        /**
         * Initializing and connecting the two rigidbodies with the configured joint properties
         * is automatically called by the physics system. No user interaction needed.
         */
        connect() {
            if (this.connected == false) {
                this.constructJoint();
                this.connected = true;
                this.superAdd();
                FudgeCore.Debug.log("called Connection For: " + this.attachedRB.getContainer().name + " / " + this.connectedRB.getContainer().name);
                FudgeCore.Debug.log("Strength: " + this.springDamping + " / " + this.springFrequency);
                FudgeCore.Debug.log(this.oimoJoint);
            }
        }
        /**
         * Disconnecting the two rigidbodies and removing them from the physics system,
         * is automatically called by the physics system. No user interaction needed.
         */
        disconnect() {
            if (this.connected == true) {
                this.superRemove();
                this.connected = false;
            }
        }
        /**
         * Returns the original Joint used by the physics engine. Used internally no user interaction needed.
         * Only to be used when functionality that is not added within Fudge is needed.
        */
        getOimoJoint() {
            return this.oimoJoint;
        }
        //#region Saving/Loading
        serialize() {
            let serialization = {
                attID: super.idAttachedRB,
                conID: super.idConnectedRB,
                axis: this.axis,
                anchor: this.anchor,
                internalCollision: this.jointInternalCollision,
                springDamping: this.jointSpringDampingRatio,
                springFrequency: this.jointSpringFrequency,
                breakForce: this.jointBreakForce,
                breakTorque: this.jointBreakTorque,
                motorLimitUpper: this.jointMotorLimitUpper,
                motorLimitLower: this.jointMotorLimitLower,
                motorSpeed: this.jointMotorSpeed,
                motorForce: this.jointMotorForce,
                [super.constructor.name]: super.baseSerialize()
            };
            return serialization;
        }
        async deserialize(_serialization) {
            super.idAttachedRB = _serialization.attID;
            super.idConnectedRB = _serialization.conID;
            if (_serialization.attID != null && _serialization.conID != null)
                super.setBodiesFromLoadedIDs();
            this.axis = _serialization.axis != null ? _serialization.axis : this.jointAxis;
            this.anchor = _serialization.anchor != null ? _serialization.anchor : this.jointAnchor;
            this.internalCollision = _serialization.internalCollision != null ? _serialization.internalCollision : false;
            this.springDamping = _serialization.springDamping != null ? _serialization.springDamping : this.jointSpringDampingRatio;
            this.springFrequency = _serialization.springFrequency != null ? _serialization.springFrequency : this.jointSpringFrequency;
            this.breakForce = _serialization.breakForce != null ? _serialization.breakForce : this.jointBreakForce;
            this.breakTorque = _serialization.breakTorque != null ? _serialization.breakTorque : this.jointBreakTorque;
            this.motorLimitUpper = _serialization.motorLimitUpper != null ? _serialization.motorLimitUpper : this.jointMotorLimitUpper;
            this.motorLimitLower = _serialization.motorLimitLower != null ? _serialization.motorLimitLower : this.jointMotorLimitLower;
            this.motorSpeed = _serialization.motorSpeed != null ? _serialization.motorSpeed : this.jointMotorSpeed;
            this.motorForce = _serialization.motorForce != null ? _serialization.motorForce : this.jointMotorForce;
            super.baseDeserialize(_serialization); //Super, Super, Component != ComponentJoint
            return this;
        }
        //#endregion
        /** Tell the FudgePhysics system that this joint needs to be handled in the next frame. */
        dirtyStatus() {
            FudgeCore.Debug.log("Dirty Status");
            FudgeCore.Physics.world.changeJointStatus(this);
        }
        /** Actual creation of a joint in the OimoPhysics system */
        constructJoint() {
            this.springDamper = new OIMO.SpringDamper().setSpring(this.jointSpringFrequency, this.jointSpringDampingRatio); //Create spring settings, either as a spring or totally rigid
            this.translationalMotor = new OIMO.TranslationalLimitMotor().setLimits(this.jointMotorLimitLower, this.jointMotorLimitUpper); //Create motor settings, to hold positions, set constraint min/max
            this.translationalMotor.setMotor(this.jointMotorSpeed, this.jointMotorForce);
            this.config = new OIMO.PrismaticJointConfig(); //Create a specific config for this joint type that is calculating the local axis for both bodies
            let attachedRBPos = this.attachedRigidbody.getContainer().mtxWorld.translation; //Setting the anchor position locally from the first rigidbody
            let worldAnchor = new OIMO.Vec3(attachedRBPos.x + this.jointAnchor.x, attachedRBPos.y + this.jointAnchor.y, attachedRBPos.z + this.jointAnchor.z);
            this.config.init(this.attachedRB.getOimoRigidbody(), this.connectedRB.getOimoRigidbody(), worldAnchor, this.jointAxis); //Initialize the config to calculate the local axis/anchors for the OimoPhysics Engine
            this.config.springDamper = this.springDamper; //Telling the config to use the motor/spring of the Fudge Component
            this.config.limitMotor = this.translationalMotor;
            var j = new OIMO.PrismaticJoint(this.config); //Creating the specific type of joint
            j.setBreakForce(this.breakForce); //Set additional infos, if the joint is unbreakable and colliding internally
            j.setBreakTorque(this.breakTorque);
            j.setAllowCollision(this.jointInternalCollision);
            this.oimoJoint = j; //Tell the Fudge Component which joint in the OimoPhysics system it represents
        }
        /** Adding this joint to the world through the general function of the base class ComponentJoint. Happening when the joint is connecting.  */
        superAdd() {
            this.addConstraintToWorld(this);
        }
        /** Removing this joint to the world through the general function of the base class ComponentJoint. Happening when this component is removed from the Node. */
        superRemove() {
            this.removeConstraintFromWorld(this);
        }
    }
    ComponentJointPrismatic.iSubclass = FudgeCore.Component.registerSubclass(ComponentJointPrismatic);
    FudgeCore.ComponentJointPrismatic = ComponentJointPrismatic;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=ComponentJointPrismatic.js.map