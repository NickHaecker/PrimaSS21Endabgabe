"use strict";
var FudgeCore;
(function (FudgeCore) {
    /**
       * A physical connection between two bodies with two defined axis (normally e.g. (0,0,1) and rotation(1,0,0)), they share the same anchor and have free rotation, but transfer the twist.
       * In reality used in cars to transfer the more stable stationary force on the velocity axis to the bumping, damped moving wheel. Two RigidBodies need to be defined to use it.
       * The two motors can be defined for the two rotation axis, along with springs.
       * ```plaintext
       *
       *                      anchor - twist is transfered between bodies
       *         z                   |
       *         ↑            -----  |  ------------
       *         |           |     | ↓ |            |
       *  -x <---|---> x     |     | x |            |           e.g. wheel can still turn up/down,
       *         |           |     |   |            |           left right but transfering it's rotation on to the wheel-axis.
       *         ↓            -----     ------------
       *        -z
       *                 attachedRB          connectedRB
       *                (e.g. wheel)       (e.g. wheel-axis)
       * ```
       * @author Marko Fehrenbach, HFU 2020
       */
    class ComponentJointUniversal extends FudgeCore.ComponentJoint {
        constructor(_attachedRigidbody = null, _connectedRigidbody = null, _firstAxis = new FudgeCore.Vector3(1, 0, 0), _secondAxis = new FudgeCore.Vector3(0, 0, 1), _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_attachedRigidbody, _connectedRigidbody);
            this.jointFirstSpringDampingRatio = 0;
            this.jointFirstSpringFrequency = 0;
            this.jointSecondSpringDampingRatio = 0;
            this.jointSecondSpringFrequency = 0;
            this.jointFirstMotorLimitUpper = 360;
            this.jointFirstMotorLimitLower = 0;
            this.jointFirstMotorTorque = 0;
            this.jointFirstMotorSpeed = 0;
            this.jointSecondMotorLimitUpper = 360;
            this.jointSecondMotorLimitLower = 0;
            this.jointSecondMotorTorque = 0;
            this.jointSecondMotorSpeed = 0;
            this.jointBreakForce = 0;
            this.jointBreakTorque = 0;
            this.config = new OIMO.UniversalJointConfig();
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
         * The damping of the spring. 1 equals completly damped.
         */
        get springDampingFirstAxis() {
            return this.jointFirstSpringDampingRatio;
        }
        set springDampingFirstAxis(_value) {
            this.jointFirstSpringDampingRatio = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getSpringDamper1().dampingRatio = this.jointFirstSpringDampingRatio;
        }
        /**
         * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
        */
        get springFrequencyFirstAxis() {
            return this.jointFirstSpringFrequency;
        }
        set springFrequencyFirstAxis(_value) {
            this.jointFirstSpringFrequency = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getSpringDamper1().frequency = this.jointFirstSpringFrequency;
        }
        /**
         * The damping of the spring. 1 equals completly damped.
         */
        get springDampingSecondAxis() {
            return this.jointSecondSpringDampingRatio;
        }
        set springDampingSecondAxis(_value) {
            this.jointSecondSpringDampingRatio = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getSpringDamper2().dampingRatio = this.jointSecondSpringDampingRatio;
        }
        /**
         * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
        */
        get springFrequencySecondAxis() {
            return this.jointSecondSpringFrequency;
        }
        set springFrequencySecondAxis(_value) {
            this.jointSecondSpringFrequency = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getSpringDamper2().frequency = this.jointSecondSpringFrequency;
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
        get motorLimitUpperFirstAxis() {
            return this.jointFirstMotorLimitUpper * 180 / Math.PI;
        }
        set motorLimitUpperFirstAxis(_value) {
            this.jointFirstMotorLimitUpper = _value * Math.PI / 180;
            if (this.oimoJoint != null)
                this.oimoJoint.getLimitMotor1().upperLimit = this.jointFirstMotorLimitUpper;
        }
        /**
          * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
         */
        get motorLimitLowerFirstAxis() {
            return this.jointFirstMotorLimitLower * 180 / Math.PI;
        }
        set motorLimitLowerFirstAxis(_value) {
            this.jointFirstMotorLimitLower = _value * Math.PI / 180;
            if (this.oimoJoint != null)
                this.oimoJoint.getLimitMotor1().lowerLimit = this.jointFirstMotorLimitLower;
        }
        /**
          * The target rotational speed of the motor in m/s.
         */
        get motorSpeedFirstAxis() {
            return this.jointFirstMotorSpeed;
        }
        set motorSpeedFirstAxis(_value) {
            this.jointFirstMotorSpeed = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getLimitMotor1().motorSpeed = this.jointFirstMotorSpeed;
        }
        /**
          * The maximum motor torque in Newton. force <= 0 equals disabled.
         */
        get motorTorqueFirstAxis() {
            return this.jointFirstMotorTorque;
        }
        set motorTorqueFirstAxis(_value) {
            this.jointFirstMotorTorque = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getLimitMotor1().motorTorque = this.jointFirstMotorTorque;
        }
        /**
        * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis-Angle measured in Degree.
       */
        get motorLimitUpperSecondAxis() {
            return this.jointSecondMotorLimitUpper * 180 / Math.PI;
        }
        set motorLimitUpperSecondAxis(_value) {
            this.jointSecondMotorLimitUpper = _value * Math.PI / 180;
            if (this.oimoJoint != null)
                this.oimoJoint.getLimitMotor2().upperLimit = this.jointSecondMotorLimitUpper;
        }
        /**
          * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
         */
        get motorLimitLowerSecondAxis() {
            return this.jointSecondMotorLimitLower * 180 / Math.PI;
        }
        set motorLimitLowerSecondAxis(_value) {
            this.jointSecondMotorLimitLower = _value * Math.PI / 180;
            if (this.oimoJoint != null)
                this.oimoJoint.getLimitMotor2().lowerLimit = this.jointSecondMotorLimitLower;
        }
        /**
          * The target rotational speed of the motor in m/s.
         */
        get motorSpeedSecondAxis() {
            return this.jointSecondMotorSpeed;
        }
        set motorSpeedSecondAxis(_value) {
            this.jointSecondMotorSpeed = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getLimitMotor2().motorSpeed = this.jointSecondMotorSpeed;
        }
        /**
          * The maximum motor torque in Newton. force <= 0 equals disabled.
         */
        get motorTorqueSecondAxis() {
            return this.jointSecondMotorTorque;
        }
        set motorTorqueSecondAxis(_value) {
            this.jointSecondMotorTorque = _value;
            if (this.oimoJoint != null)
                this.oimoJoint.getLimitMotor2().motorTorque = this.jointSecondMotorTorque;
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
                springDampingFirstAxis: this.jointFirstSpringDampingRatio,
                springFrequencyFirstAxis: this.jointFirstSpringFrequency,
                springDampingSecondAxis: this.jointSecondSpringDampingRatio,
                springFrequencySecondAxis: this.jointSecondSpringFrequency,
                motorLimitUpperFirstAxis: this.jointFirstMotorLimitUpper,
                motorLimitLowerFirstAxis: this.jointFirstMotorLimitLower,
                motorSpeedFirstAxis: this.jointFirstMotorSpeed,
                motorTorqueFirstAxis: this.jointFirstMotorTorque,
                motorLimitUpperSecondAxis: this.jointSecondMotorLimitUpper,
                motorLimitLowerSecondAxis: this.jointSecondMotorLimitLower,
                motorSpeedSecondAxis: this.jointSecondMotorSpeed,
                motorTorqueSecondAxis: this.jointSecondMotorTorque,
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
            this.springDampingFirstAxis = _serialization.springDampingFirstAxis != null ? _serialization.springDampingFirstAxis : this.jointFirstSpringDampingRatio;
            this.springFrequencyFirstAxis = _serialization.springFrequencyFirstAxis != null ? _serialization.springFrequencyFirstAxis : this.jointFirstSpringFrequency;
            this.springDampingSecondAxis = _serialization.springDampingSecondAxis != null ? _serialization.springDampingSecondAxis : this.jointSecondSpringDampingRatio;
            this.springFrequencySecondAxis = _serialization.springFrequencySecondAxis != null ? _serialization.springFrequencySecondAxis : this.jointSecondSpringFrequency;
            this.motorLimitUpperFirstAxis = _serialization.motorLimitUpperFirstAxis != null ? _serialization.motorLimitUpperFirstAxis : this.jointFirstMotorLimitUpper;
            this.motorLimitLowerFirstAxis = _serialization.motorLimitLowerFirstAxis != null ? _serialization.motorLimitLowerFirstAxis : this.jointFirstMotorLimitUpper;
            this.motorSpeedFirstAxis = _serialization.motorSpeedFirstAxis != null ? _serialization.motorSpeedFirstAxis : this.jointFirstMotorSpeed;
            this.motorTorqueFirstAxis = _serialization.motorTorqueFirstAxis != null ? _serialization.motorTorqueFirstAxis : this.jointFirstMotorTorque;
            this.motorLimitUpperSecondAxis = _serialization.motorLimitUpperSecondAxis != null ? _serialization.motorLimitUpperSecondAxis : this.jointSecondMotorLimitUpper;
            this.motorLimitLowerSecondAxis = _serialization.motorLimitLowerSecondAxis != null ? _serialization.motorLimitLowerSecondAxis : this.jointSecondMotorLimitUpper;
            this.motorSpeedSecondAxis = _serialization.motorSpeedSecondAxis != null ? _serialization.motorSpeedSecondAxis : this.jointSecondMotorSpeed;
            this.motorTorqueSecondAxis = _serialization.motorTorqueSecondAxis != null ? _serialization.motorTorqueSecondAxis : this.jointSecondMotorTorque;
            super.baseDeserialize(_serialization);
            return this;
        }
        //#endregion
        dirtyStatus() {
            FudgeCore.Physics.world.changeJointStatus(this);
        }
        constructJoint() {
            this.firstAxisSpringDamper = new OIMO.SpringDamper().setSpring(this.jointFirstSpringFrequency, this.jointFirstSpringDampingRatio);
            this.secondAxisSpringDamper = new OIMO.SpringDamper().setSpring(this.jointSecondSpringFrequency, this.jointSecondSpringDampingRatio);
            this.firstAxisMotor = new OIMO.RotationalLimitMotor().setLimits(this.jointFirstMotorLimitLower, this.jointFirstMotorLimitUpper);
            this.firstAxisMotor.setMotor(this.jointFirstMotorSpeed, this.jointFirstMotorTorque);
            this.secondAxisMotor = new OIMO.RotationalLimitMotor().setLimits(this.jointFirstMotorLimitLower, this.jointFirstMotorLimitUpper);
            this.secondAxisMotor.setMotor(this.jointFirstMotorSpeed, this.jointFirstMotorTorque);
            this.config = new OIMO.UniversalJointConfig();
            let attachedRBPos = this.attachedRigidbody.getContainer().mtxWorld.translation;
            let worldAnchor = new OIMO.Vec3(attachedRBPos.x + this.jointAnchor.x, attachedRBPos.y + this.jointAnchor.y, attachedRBPos.z + this.jointAnchor.z);
            this.config.init(this.attachedRB.getOimoRigidbody(), this.connectedRB.getOimoRigidbody(), worldAnchor, this.jointFirstAxis, this.jointSecondAxis);
            this.config.limitMotor1 = this.firstAxisMotor;
            this.config.limitMotor2 = this.secondAxisMotor;
            this.config.springDamper1 = this.firstAxisSpringDamper;
            this.config.springDamper2 = this.secondAxisSpringDamper;
            var j = new OIMO.UniversalJoint(this.config);
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
    ComponentJointUniversal.iSubclass = FudgeCore.Component.registerSubclass(ComponentJointUniversal);
    FudgeCore.ComponentJointUniversal = ComponentJointUniversal;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=ComponentJointUniversal.js.map