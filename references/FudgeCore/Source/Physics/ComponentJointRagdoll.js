"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
        * A physical connection between two bodies, designed to simulate behaviour within a real body. It has two axis, a swing and twist axis, and also the perpendicular axis,
        * similar to a Spherical joint, but more restrictive in it's angles and only two degrees of freedom. Two RigidBodies need to be defined to use it. Mostly used to create humanlike joints that behave like a
        * lifeless body.
        * ```plaintext
        *
        *                      anchor - it can twist on one axis and swing on another
        *         z                   |
        *         ↑            -----  |  ------------
        *         |           |     | ↓ |            |        e.g. z = TwistAxis, it can rotate in-itself around this axis
        *  -x <---|---> x     |     | x |            |        e.g. x = SwingAxis, it can rotate anchored around the base on this axis
        *         |           |     |   |            |
        *         ↓            -----     ------------         e.g. you can twist the leg in-itself to a certain degree,
        *        -z                                           but also rotate it forward/backward/left/right to a certain degree
        *                attachedRB          connectedRB
        *              (e.g. upper-leg)         (e.g. pelvis)
        *
        * ```
        * Twist equals a rotation around a point without moving on an axis.
        * Swing equals a rotation on a point with a moving local axis.
        * @author Marko Fehrenbach, HFU, 2020
        */
    class ComponentJointRagdoll extends FudgeCore.ComponentJoint {
        constructor(_attachedRigidbody = null, _connectedRigidbody = null, _firstAxis = new FudgeCore.Vector3(1, 0, 0), _secondAxis = new FudgeCore.Vector3(0, 0, 1), _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_attachedRigidbody, _connectedRigidbody);
            this.jointTwistSpringDampingRatio = 0;
            this.jointTwistSpringFrequency = 0;
            this.jointSwingSpringDampingRatio = 0;
            this.jointSwingSpringFrequency = 0;
            this.jointTwistMotorLimitUpper = 360;
            this.jointTwistMotorLimitLower = 0;
            this.jointTwistMotorTorque = 0;
            this.jointTwistMotorSpeed = 0;
            this.jointBreakForce = 0;
            this.jointBreakTorque = 0;
            this.config = new OIMO.RagdollJointConfig();
            this.jointFirstAxis = new OIMO.Vec3(_firstAxis.x, _firstAxis.y, _firstAxis.z);
            this.jointSecondAxis = new OIMO.Vec3(_secondAxis.x, _secondAxis.y, _secondAxis.z);
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
        get firstAxis() {
            return new FudgeCore.Vector3(this.jointFirstAxis.x, this.jointFirstAxis.y, this.jointFirstAxis.z);
        }
        set firstAxis(_value) {
            this.jointFirstAxis = new OIMO.Vec3(_value.x, _value.y, _value.z);
            this.disconnect();
            this.dirtyStatus();
        }
        /**
        * The axis connecting the the two [[Node]]s e.g. Vector3(0,1,0) to have a upward connection.
        *  When changed after initialization the joint needs to be reconnected.
        */
        get secondAxis() {
            return new FudgeCore.Vector3(this.jointSecondAxis.x, this.jointSecondAxis.y, this.jointSecondAxis.z);
        }
        set secondAxis(_value) {
            this.jointSecondAxis = new OIMO.Vec3(_value.x, _value.y, _value.z);
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
         * The maximum angle of rotation along the first axis. Value needs to be positive. Changes do rebuild the joint
         */
        get maxAngleFirstAxis() {
            return this.jointMaxAngle1 * 180 / Math.PI;
        }
        set maxAngleFirstAxis(_value) {
            this.jointMaxAngle1 = _value * Math.PI / 180;
            this.disconnect();
            this.dirtyStatus();
        }
        /**
         * The maximum angle of rotation along the second axis. Value needs to be positive. Changes do rebuild the joint
         */
        get maxAngleSecondAxis() {
            return this.jointMaxAngle2 * 180 / Math.PI;
        }
        set maxAngleSecondAxis(_value) {
            this.jointMaxAngle2 = _value * Math.PI / 180;
            this.disconnect();
            this.dirtyStatus();
        }
        /**
         * The damping of the spring. 1 equals completly damped.
         */
        get springDampingTwist() {
            return this.jointTwistSpringDampingRatio;
        }
        set springDampingTwist(_value) {
            this.jointTwistSpringDampingRatio = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getTwistSpringDamper().dampingRatio = this.jointTwistSpringDampingRatio;
        }
        /**
         * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
        */
        get springFrequencyTwist() {
            return this.jointTwistSpringFrequency;
        }
        set springFrequencyTwist(_value) {
            this.jointTwistSpringFrequency = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getTwistSpringDamper().frequency = this.jointTwistSpringFrequency;
        }
        /**
         * The damping of the spring. 1 equals completly damped.
         */
        get springDampingSwing() {
            return this.jointSwingSpringDampingRatio;
        }
        set springDampingSwing(_value) {
            this.jointSwingSpringDampingRatio = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getSwingSpringDamper().dampingRatio = this.jointSwingSpringDampingRatio;
        }
        /**
         * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
        */
        get springFrequencySwing() {
            return this.jointSwingSpringFrequency;
        }
        set springFrequencySwing(_value) {
            this.jointSwingSpringFrequency = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getSwingSpringDamper().frequency = this.jointSwingSpringFrequency;
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
          * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis-Angle measured in Degree.
         */
        get twistMotorLimitUpper() {
            return this.jointTwistMotorLimitUpper * 180 / Math.PI;
        }
        set twistMotorLimitUpper(_value) {
            this.jointTwistMotorLimitUpper = _value * Math.PI / 180;
            if (this.oimoJoint != null)
                this.oimoJoint.getTwistLimitMotor().upperLimit = this.jointTwistMotorLimitUpper;
        }
        /**
          * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
         */
        get twistMotorLimitLower() {
            return this.jointTwistMotorLimitLower * 180 / Math.PI;
        }
        set twistMotorLimitLower(_value) {
            this.jointTwistMotorLimitLower = _value * Math.PI / 180;
            if (this.oimoJoint != null)
                this.oimoJoint.getTwistLimitMotor().lowerLimit = this.jointTwistMotorLimitLower;
        }
        /**
          * The target rotational speed of the motor in m/s.
         */
        get twistMotorSpeed() {
            return this.jointTwistMotorSpeed;
        }
        set twistMotorSpeed(_value) {
            this.jointTwistMotorSpeed = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getTwistLimitMotor().motorSpeed = this.jointTwistMotorSpeed;
        }
        /**
          * The maximum motor torque in Newton. force <= 0 equals disabled.
         */
        get twistMotorTorque() {
            return this.twistMotorTorque;
        }
        set twistMotorTorque(_value) {
            this.twistMotorTorque = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getTwistLimitMotor().motorTorque = this.twistMotorTorque;
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
                anchor: this.anchor,
                internalCollision: this.jointInternalCollision,
                breakForce: this.jointBreakForce,
                breakTorque: this.jointBreakTorque,
                firstAxis: this.jointFirstAxis,
                secondAxis: this.jointSecondAxis,
                maxAngleFirstAxis: this.jointMaxAngle1,
                maxAngleSecondAxis: this.jointMaxAngle2,
                springDampingTwist: this.jointTwistSpringDampingRatio,
                springFrequencyTwist: this.jointTwistSpringFrequency,
                springDampingSwing: this.jointSwingSpringDampingRatio,
                springFrequencySwing: this.jointSwingSpringFrequency,
                twistMotorLimitUpper: this.jointTwistMotorLimitUpper,
                twistMotorLimitLower: this.jointTwistMotorLimitLower,
                twistMotorSpeed: this.twistMotorSpeed,
                twistMotorTorque: this.twistMotorTorque,
                [super.constructor.name]: super.baseSerialize()
            };
            return serialization;
        }
        async deserialize(_serialization) {
            super.idAttachedRB = _serialization.attID;
            super.idConnectedRB = _serialization.conID;
            if (_serialization.attID != null && _serialization.conID != null)
                super.setBodiesFromLoadedIDs();
            this.anchor = _serialization.anchor != null ? _serialization.anchor : this.jointAnchor;
            this.internalCollision = _serialization.internalCollision != null ? _serialization.internalCollision : false;
            this.breakForce = _serialization.breakForce != null ? _serialization.breakForce : this.jointBreakForce;
            this.breakTorque = _serialization.breakTorque != null ? _serialization.breakTorque : this.jointBreakTorque;
            this.firstAxis = _serialization.firstAxis != null ? _serialization.firstAxis : this.jointFirstAxis;
            this.secondAxis = _serialization.secondAxis != null ? _serialization.secondAxis : this.jointSecondAxis;
            this.maxAngleFirstAxis = _serialization.maxAngleFirstAxis != null ? _serialization.maxAngleFirstAxis : this.jointMaxAngle1;
            this.maxAngleSecondAxis = _serialization.maxAngleSecondAxis != null ? _serialization.maxAngleSecondAxis : this.jointMaxAngle2;
            this.springDampingTwist = _serialization.springDampingTwist != null ? _serialization.springDampingTwist : this.jointTwistSpringDampingRatio;
            this.springFrequencyTwist = _serialization.springFrequencyTwist != null ? _serialization.springFrequencyTwist : this.jointTwistSpringFrequency;
            this.springDampingSwing = _serialization.springDampingSwing != null ? _serialization.springDampingSwing : this.jointSwingSpringDampingRatio;
            this.springFrequencySwing = _serialization.springFrequencySwing != null ? _serialization.springFrequencySwing : this.jointSwingSpringFrequency;
            this.twistMotorLimitUpper = _serialization.twistMotorLimitUpper != null ? _serialization.twistMotorLimitUpper : this.jointTwistMotorLimitUpper;
            this.twistMotorLimitLower = _serialization.twistMotorLimitLower != null ? _serialization.twistMotorLimitLower : this.jointTwistMotorLimitLower;
            this.twistMotorSpeed = _serialization.twistMotorSpeed != null ? _serialization.twistMotorSpeed : this.jointTwistMotorSpeed;
            this.twistMotorTorque = _serialization.twistMotorTorque != null ? _serialization.twistMotorTorque : this.jointTwistMotorTorque;
            super.baseDeserialize(_serialization);
            return this;
        }
        //#endregion
        dirtyStatus() {
            FudgeCore.Physics.world.changeJointStatus(this);
        }
        constructJoint() {
            this.jointTwistSpringDamper = new OIMO.SpringDamper().setSpring(this.jointTwistSpringFrequency, this.jointTwistSpringDampingRatio);
            this.jointSwingSpringDamper = new OIMO.SpringDamper().setSpring(this.jointSwingSpringFrequency, this.jointSwingSpringDampingRatio);
            this.jointTwistMotor = new OIMO.RotationalLimitMotor().setLimits(this.jointTwistMotorLimitLower, this.jointTwistMotorLimitUpper);
            this.jointTwistMotor.setMotor(this.jointTwistMotorSpeed, this.jointTwistMotorTorque);
            this.config = new OIMO.RagdollJointConfig();
            let attachedRBPos = this.attachedRigidbody.getContainer().mtxWorld.translation;
            let worldAnchor = new OIMO.Vec3(attachedRBPos.x + this.jointAnchor.x, attachedRBPos.y + this.jointAnchor.y, attachedRBPos.z + this.jointAnchor.z);
            this.config.init(this.attachedRB.getOimoRigidbody(), this.connectedRB.getOimoRigidbody(), worldAnchor, this.jointFirstAxis, this.jointSecondAxis);
            this.config.swingSpringDamper = this.jointSwingSpringDamper;
            this.config.twistSpringDamper = this.jointTwistSpringDamper;
            this.config.twistLimitMotor = this.jointTwistMotor;
            this.config.maxSwingAngle1 = this.jointMaxAngle1;
            this.config.maxSwingAngle2 = this.jointMaxAngle2;
            var j = new OIMO.RagdollJoint(this.config);
            j.setBreakForce(this.breakForce);
            j.setBreakTorque(this.breakTorque);
            j.setAllowCollision(this.jointInternalCollision);
            this.oimoJoint = j;
        }
        superAdd() {
            this.addConstraintToWorld(this);
        }
        superRemove() {
            this.removeConstraintFromWorld(this);
        }
    }
    ComponentJointRagdoll.iSubclass = FudgeCore.Component.registerSubclass(ComponentJointRagdoll);
    FudgeCore.ComponentJointRagdoll = ComponentJointRagdoll;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=ComponentJointRagdoll.js.map