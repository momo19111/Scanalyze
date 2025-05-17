const mongoose = require('mongoose');


const testSchema = new mongoose.Schema({
  testName: { type: String, required: true },
  value: { type: String, required: true },
  normalRange: { type: String, required: true },
  unit: { type: String, required: true },
  status: { type: String, required: true }
}, { _id: false });

const testResultSchema = new mongoose.Schema({
  category: { type: String, required: true },
  tests: [testSchema]
}, { _id: false });

const labReportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch'},
  labTechnician: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientSnapshot: {
    firstName: String,
    lastName: String,
    phone: String,
    email: String,
    gender: String,
    nationalID: String,
    medicalHistory:  {
        chronicDiseases: {
            hasChronicDiseases: { type: Boolean, default: false },
            diseasesList: [{ type: String }],
            otherDiseases: { type: String }
        },
        allergies: {
            hasAllergies: { type: Boolean, default: false },
            allergyDetails: { type: String }
        },
        medications: {
            takesMedications: { type: Boolean, default: false },
            list: [
            {
                name: { type: String },
                dosage: { type: String },
                reason: { type: String }
            }
            ]
        },
        surgeries: {
            hadSurgeries: { type: Boolean, default: false },
            surgeryDetails: { type: String }
        },
        currentSymptoms: {
            hasSymptoms: { type: Boolean, default: false },
            symptomsDetails: { type: String }
        },
        lifestyle: {
            smokes: { type: Boolean, default: false },
            consumesAlcohol: { type: Boolean, default: false }
        }
},
    birthDate: String,
    age: Number
  },
  testResults: [testResultSchema]
}, { timestamps: true });

function processNationalId(doc) {
    if (!doc.nationalID || doc.nationalID.length !== 14) {
        return new Error('Invalid national ID format. It should be 14 digits long.', 400);
    };

    const century = doc.nationalID.charAt(0) === '2' ? '19' : '20';
    const year = century + doc.nationalID.substring(1, 3);
    const month = doc.nationalID.substring(3, 5);
    const day = doc.nationalID.substring(5, 7);
    const birthDate = new Date(`${year}-${month}-${day}`);
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() || 
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
        age--;
        }

    doc.birthDate = birthDate.toISOString().split('T')[0];
    doc.age = age;
}


labReportSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();

  // Only run if the patient field is changing
  if (update.patient) {
    const Patient = mongoose.model('Patient');
    const patientData = await Patient.findById(update.patient).lean();

    if (patientData) {
      const snapshot = {
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        phone: patientData.phone,
        email: patientData.email,
        gender: patientData.gender,
        medicalHistory: patientData.medicalHistory,
        nationalID: patientData.nationalID,
        birthDate: patientData.birthDate,
        age: patientData.age,
      };

      // Process the snapshot if necessary
      processNationalId(snapshot);

      // Update the document with the patientSnapshot
      this.setUpdate({
        ...update,
        patientSnapshot: snapshot,
      });
    }
  }

  next();
});


labReportSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('patient')) {
      const Patient = mongoose.model('Patient');
      const patientData = await Patient.findById(this.patient);

      if (patientData) {
        this.patientSnapshot = {
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          phone: patientData.phone,
          email: patientData.email,
          gender: patientData.gender,
          medicalHistory: patientData.medicalHistory,
          nationalID: patientData.nationalID,
          birthDate: patientData.birthDate,
          age: patientData.age
        };

        // Process the national ID
        processNationalId(this.patientSnapshot);
      } else {
        console.error("No patient data found for patient ID:", this.patient);
      }

      next(); // Proceed after everything is done

  } else {
    next(); // If no patient field was modified, just continue
  }
});


module.exports = mongoose.model('Lab', labReportSchema);
