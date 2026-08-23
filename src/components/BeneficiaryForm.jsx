import React, { useState, useEffect } from 'react';
import { AWASLogo } from './AWASLogo';
import { 
  Printer, RotateCcw, Send, CheckSquare, Square, AlertCircle, Image as ImageIcon
} from 'lucide-react';
import { dbService } from '../lib/db';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi (NCT)', 'Jammu & Kashmir', 'Ladakh', 'Puducherry'
];

const INITIAL_FORM = {
  // Metadata
  formNo: 'AWI-2026-877526',
  applicationDate: new Date().toISOString().split('T')[0],

  // Section 1: Personal Details
  applicantFullName: '',
  regionalLanguageName: '',
  passportPhoto: null,
  passportPhotoPreview: null,
  fatherHusbandName: '',
  motherName: '',
  dob: '',
  age: '',
  gender: '',
  maritalStatus: '',
  religion: '',
  category: '',
  nationality: 'Indian',
  mobileNumber: '',
  alternateMobile: '',
  emailAddress: '',

  // Section 2: Identity Details
  aadhaarNumber: '',
  rationCardNumber: '',
  voterIdNumber: '',
  panCardNumber: '',
  casteCertificateNo: '',
  incomeCertificateNo: '',

  // Section 3: Address Details
  presentHouseNo: '',
  presentStreet: '',
  presentVillageTown: '',
  presentPostOffice: '',
  presentTehsil: '',
  presentDistrict: '',
  presentState: '',
  presentPinCode: '',

  sameAsPresent: false,

  permanentHouseNo: '',
  permanentStreet: '',
  permanentVillageTown: '',
  permanentPostOffice: '',
  permanentTehsil: '',
  permanentDistrict: '',
  permanentState: '',
  permanentPinCode: '',

  // Section 4: Family Details
  totalFamilyMembers: '1',
  annualFamilyIncome: '',
  bplAplStatus: '',
  typeOfResidence: '',
  landHoldingAcres: '0',
  noOfDependents: '0',
  noOfChildren: '0',
  primaryEarningMember: '',

  // Section 5: Occupation & Bank
  occupation: '',
  educationalQualification: '',
  disability: 'None / कोई नहीं',
  bankAccountNumber: '',
  bankName: '',
  ifscCode: '',
  branchName: '',
  accountHolderName: '',
  accountType: 'Savings',

  // Section 6: Documents & Uploads
  enclosedDocuments: [],
  signingDate: new Date().toISOString().split('T')[0],
  signingPlace: '',
  signatureFile: null,
  signaturePreview: null,
  thumbFile: null,
  thumbPreview: null,

  // Section 7: Declaration
  agreedDeclaration: false
};

const DOCUMENT_OPTIONS = [
  'Aadhaar Card Copy', 'Ration Card', 'Caste Certificate', 'Income Certificate',
  'Bank Passbook Copy', 'Passport Photograph', 'Disability Certificate', 'BPL Card',
  'Voter ID Copy', 'PAN Card Copy', 'Land Records', 'Residence Proof'
];

// Helper: Compress Image to WebP on Client Side (Reduces bandwidth by ~95%)
const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to lightweight WebP data URL
        const dataUrl = canvas.toDataURL('image/webp', quality);
        resolve(dataUrl);
      };
    };
  });
};

export const BeneficiaryForm = ({ currentUser, onSubmitSuccess }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate unique form number on mount
  useEffect(() => {
    const randomFormNo = `AWI-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    setFormData(prev => ({ ...prev, formNo: randomFormNo }));
  }, []);

  // Pre-fill user data if available
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        applicantFullName: currentUser.full_name || prev.applicantFullName,
        emailAddress: currentUser.email || prev.emailAddress,
        presentState: currentUser.state || prev.presentState
      }));
    }
  }, [currentUser]);

  // Handle DOB change & calculate Age automatically
  const handleDobChange = (e) => {
    const dobVal = e.target.value;
    let calculatedAge = '';
    if (dobVal) {
      const birthDate = new Date(dobVal);
      const today = new Date();
      let ageYears = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        ageYears--;
      }
      calculatedAge = ageYears >= 0 ? ageYears.toString() : '0';
    }
    setFormData(prev => ({
      ...prev,
      dob: dobVal,
      age: calculatedAge
    }));
  };

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      // Auto copy address if sameAsPresent is toggled
      if (name === 'sameAsPresent' && checked) {
        updated.permanentHouseNo = prev.presentHouseNo;
        updated.permanentStreet = prev.presentStreet;
        updated.permanentVillageTown = prev.presentVillageTown;
        updated.permanentPostOffice = prev.presentPostOffice;
        updated.permanentTehsil = prev.presentTehsil;
        updated.permanentDistrict = prev.presentDistrict;
        updated.permanentState = prev.presentState;
        updated.permanentPinCode = prev.presentPinCode;
      }
      return updated;
    });
  };

  // Document Checkbox Toggle
  const handleDocumentToggle = (docName) => {
    setFormData(prev => {
      const docs = prev.enclosedDocuments.includes(docName)
        ? prev.enclosedDocuments.filter(d => d !== docName)
        : [...prev.enclosedDocuments, docName];
      return { ...prev, enclosedDocuments: docs };
    });
  };

  // Optimized File Upload Handler with WebP Client-Side Compression
  const handleFileChange = async (e, fieldName, previewName) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10 MB limit.');
        return;
      }
      // Compress image client side before storing to save 95% bandwidth
      const compressedDataUrl = await compressImage(file, 600, 0.65);
      setFormData(prev => ({
        ...prev,
        [fieldName]: file,
        [previewName]: compressedDataUrl
      }));
    }
  };

  // Reset Form
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all form fields?')) {
      const newFormNo = `AWI-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      setFormData({ ...INITIAL_FORM, formNo: newFormNo });
      setError('');
    }
  };

  // Print Form Action
  const handlePrint = () => {
    window.print();
  };

  // Submit Application
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field Validations
    if (!formData.applicantFullName.trim()) return setError('Applicant Full Name is required.');
    if (!formData.fatherHusbandName.trim()) return setError('Father / Husband Name is required.');
    if (!formData.dob) return setError('Date of Birth is required.');
    if (!formData.gender) return setError('Gender selection is required.');
    if (!formData.maritalStatus) return setError('Marital Status selection is required.');
    if (!formData.category) return setError('Category selection is required.');
    if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 10) return setError('Valid 10-digit Mobile Number is required.');
    if (!formData.aadhaarNumber.trim()) return setError('Aadhaar Number is required.');
    if (!formData.presentVillageTown.trim()) return setError('Village / Town is required in address.');
    if (!formData.presentTehsil.trim()) return setError('Tehsil / Taluka is required in address.');
    if (!formData.presentDistrict.trim()) return setError('District is required in address.');
    if (!formData.presentState) return setError('State is required in address.');
    if (!formData.presentPinCode.trim()) return setError('PIN Code is required.');
    if (!formData.annualFamilyIncome) return setError('Annual Family Income is required.');
    if (!formData.bplAplStatus) return setError('BPL / APL status selection is required.');
    if (!formData.occupation) return setError('Occupation is required.');
    if (!formData.bankAccountNumber.trim()) return setError('Bank Account Number is required.');
    if (!formData.bankName.trim()) return setError('Bank Name is required.');
    if (!formData.ifscCode.trim()) return setError('IFSC Code is required.');
    if (!formData.signingPlace.trim()) return setError('Place of signing is required.');
    if (!formData.agreedDeclaration) return setError('You must agree to the declaration.');

    setLoading(true);

    try {
      const payload = {
        user_id: currentUser?.id || null,
        form_no: formData.formNo,
        application_date: formData.applicationDate,
        status: 'pending',

        applicant_full_name: formData.applicantFullName,
        regional_language_name: formData.regionalLanguageName,
        passport_photo_url: formData.passportPhotoPreview,
        father_husband_name: formData.fatherHusbandName,
        mother_name: formData.motherName,
        dob: formData.dob,
        age: parseInt(formData.age) || 0,
        gender: formData.gender,
        marital_status: formData.maritalStatus,
        religion: formData.religion,
        category: formData.category,
        nationality: formData.nationality,
        mobile_number: formData.mobileNumber,
        alternate_mobile: formData.alternateMobile,
        email_address: formData.emailAddress,

        aadhaar_number: formData.aadhaarNumber,
        ration_card_number: formData.rationCardNumber,
        voter_id_number: formData.voterIdNumber,
        pan_card_number: formData.panCardNumber,
        caste_certificate_no: formData.casteCertificateNo,
        income_certificate_no: formData.incomeCertificateNo,

        present_address: {
          houseNo: formData.presentHouseNo,
          street: formData.presentStreet,
          villageTown: formData.presentVillageTown,
          postOffice: formData.presentPostOffice,
          tehsil: formData.presentTehsil,
          district: formData.presentDistrict,
          state: formData.presentState,
          pinCode: formData.presentPinCode
        },
        permanent_address: {
          houseNo: formData.permanentHouseNo,
          street: formData.permanentStreet,
          villageTown: formData.permanentVillageTown,
          postOffice: formData.permanentPostOffice,
          tehsil: formData.permanentTehsil,
          district: formData.permanentDistrict,
          state: formData.permanentState,
          pinCode: formData.permanentPinCode
        },
        same_as_present: formData.sameAsPresent,

        total_family_members: parseInt(formData.totalFamilyMembers) || 1,
        annual_family_income: parseFloat(formData.annualFamilyIncome) || 0,
        bpl_apl_status: formData.bplAplStatus,
        type_of_residence: formData.typeOfResidence,
        land_holding_acres: parseFloat(formData.landHoldingAcres) || 0,
        no_of_dependents: parseInt(formData.noOfDependents) || 0,
        no_of_children: parseInt(formData.noOfChildren) || 0,
        primary_earning_member: formData.primaryEarningMember,

        occupation: formData.occupation,
        educational_qualification: formData.educationalQualification,
        disability: formData.disability,
        bank_account_number: formData.bankAccountNumber,
        bank_name: formData.bankName,
        ifsc_code: formData.ifscCode,
        branch_name: formData.branchName,
        account_holder_name: formData.accountHolderName,
        account_type: formData.accountType,

        enclosed_documents: formData.enclosedDocuments,
        signing_date: formData.signingDate,
        signing_place: formData.signingPlace,
        signature_url: formData.signaturePreview,
        thumb_impression_url: formData.thumbPreview,
        agreed_declaration: formData.agreedDeclaration
      };

      const saved = await dbService.saveApplication(payload);
      onSubmitSuccess(saved || payload);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      
      {/* Main Card Container */}
      <div className="awas-card bg-white rounded-lg shadow-xl overflow-hidden border border-slate-300">
        
        {/* Header Card Box (Exact Blue matching Screenshots 3 & 4) */}
        <div className="bg-brand-navy text-white pt-6 pb-5 px-6 text-center flex flex-col items-center">
          <AWASLogo size="large" className="mb-2" />
          <h2 className="text-xs font-semibold tracking-wider text-blue-200 uppercase">
            AWAS INDIA / आवास इंडिया
          </h2>
          <h3 className="text-lg sm-text-xl font-extrabold mt-1 text-white uppercase tracking-tight">
            AWAS Yojana — Beneficiary Registration Form
          </h3>
          <p className="text-xs text-amber-300 font-medium mt-1">
            सभी <span className="text-red-400 font-bold">*</span> चिन्हित फ़ील्ड अनिवार्य हैं | All fields marked <span className="text-red-400 font-bold">*</span> are mandatory
          </p>
        </div>

        {/* Subheader Metadata Strip */}
        <div className="bg-slate-100 px-6 py-2-5 border-b border-slate-300 flex flex-wrap items-center justify-between text-xs text-slate-700 font-semibold gap-2">
          <div>
            <span>Form No: </span>
            <strong className="text-blue-700 font-extrabold">{formData.formNo}</strong>
          </div>
          <div>
            <span>Date of Application: </span>
            <strong className="text-slate-900">{formData.applicationDate.split('-').reverse().join('/')}</strong>
          </div>
          <div className="bg-slate-200 text-slate-600 text-xs px-2-5 py-0-5 rounded border border-slate-300">
            Office Use Only
          </div>
        </div>

        {/* Form Content Body */}
        <form onSubmit={handleSubmit} className="p-4 sm-p-8 space-y-8">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-md p-3-5 flex items-start gap-2-5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0-5" />
              <div className="font-semibold">{error}</div>
            </div>
          )}

          {/* SECTION 1: PERSONAL DETAILS */}
          <section className="space-y-4">
            <div className="awas-section-header">
              1. PERSONAL DETAILS / व्यक्तिगत विवरण
            </div>

            <div className="grid grid-cols-1 md-grid-cols-12 gap-4 items-start">
              
              {/* Left Column: Form Fields (Cols 1-9) */}
              <div className="md-col-span-9 grid grid-cols-1 sm-grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    APPLICANT FULL NAME <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="applicantFullName"
                    value={formData.applicantFullName}
                    onChange={handleChange}
                    placeholder="As per Aadhaar"
                    className="awas-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    NAME IN REGIONAL LANGUAGE
                  </label>
                  <input
                    type="text"
                    name="regionalLanguageName"
                    value={formData.regionalLanguageName}
                    onChange={handleChange}
                    placeholder="स्थानीय भाषा में नाम"
                    className="awas-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    FATHER / HUSBAND NAME <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fatherHusbandName"
                    value={formData.fatherHusbandName}
                    onChange={handleChange}
                    placeholder="Enter Father or Husband Name"
                    className="awas-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    MOTHER NAME
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    placeholder="Enter Mother Name"
                    className="awas-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    DATE OF BIRTH <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleDobChange}
                    className="awas-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    AGE (YEARS)
                  </label>
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    readOnly
                    placeholder="Auto calculated"
                    className="awas-input bg-slate-100 text-slate-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    GENDER <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="awas-select"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender / Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    MARITAL STATUS <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleChange}
                    className="awas-select"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Married">Married</option>
                    <option value="Unmarried">Unmarried</option>
                    <option value="Widow / Widower">Widow / Widower</option>
                    <option value="Divorced">Divorced / Separated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    RELIGION
                  </label>
                  <select
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                    className="awas-select"
                  >
                    <option value="">Select Religion</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Christian">Christian</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Buddhist">Buddhist</option>
                    <option value="Jain">Jain</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    CATEGORY <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="awas-select"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="General">General</option>
                    <option value="SC">SC (Scheduled Caste)</option>
                    <option value="ST">ST (Scheduled Tribe)</option>
                    <option value="OBC">OBC (Other Backward Class)</option>
                    <option value="EWS">EWS (Economically Weaker)</option>
                    <option value="Minority">Minority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    NATIONALITY
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    readOnly
                    className="awas-input bg-slate-100 text-slate-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    MOBILE NUMBER <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="10-digit mobile"
                    maxLength={10}
                    className="awas-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    ALTERNATE MOBILE
                  </label>
                  <input
                    type="tel"
                    name="alternateMobile"
                    value={formData.alternateMobile}
                    onChange={handleChange}
                    placeholder="Optional 10-digit mobile"
                    maxLength={10}
                    className="awas-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    placeholder="optional"
                    className="awas-input"
                  />
                </div>

              </div>

              {/* Right Column: Passport Photo Box */}
              <div className="md-col-span-3 flex flex-col items-center">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 w-full text-center">
                  PASSPORT PHOTO
                </label>
                
                <label className="upload-box w-full max-w-[170px] min-h-[200px] flex flex-col items-center justify-center p-3 cursor-pointer">
                  {formData.passportPhotoPreview ? (
                    <img 
                      src={formData.passportPhotoPreview} 
                      alt="Applicant Photo" 
                      className="w-full h-40 object-cover rounded border border-slate-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">Click to Upload Passport Photo</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, 'passportPhoto', 'passportPhotoPreview')} 
                    className="hidden" 
                  />
                  <div className="mt-2 text-center text-xs text-emerald-600 font-bold">
                    Auto-Compressed (WebP)
                  </div>
                  <div className="text-xs text-slate-500">
                    3.5 × 4.5 cm
                  </div>
                </label>
              </div>

            </div>
          </section>

          {/* SECTION 2: IDENTITY & DOCUMENT DETAILS */}
          <section className="space-y-4">
            <div className="awas-section-header">
              2. IDENTITY & DOCUMENT DETAILS / पहचान विवरण
            </div>

            <div className="grid grid-cols-1 sm-grid-cols-2 md-grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  AADHAAR NUMBER <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  placeholder="XXXX XXXX XXXX"
                  maxLength={14}
                  className="awas-input font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  RATION CARD NUMBER
                </label>
                <input
                  type="text"
                  name="rationCardNumber"
                  value={formData.rationCardNumber}
                  onChange={handleChange}
                  placeholder="Ration Card No"
                  className="awas-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  VOTER ID NUMBER
                </label>
                <input
                  type="text"
                  name="voterIdNumber"
                  value={formData.voterIdNumber}
                  onChange={handleChange}
                  placeholder="Voter Card No"
                  className="awas-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  PAN CARD NUMBER
                </label>
                <input
                  type="text"
                  name="panCardNumber"
                  value={formData.panCardNumber}
                  onChange={handleChange}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="awas-input uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  CASTE CERTIFICATE NO.
                </label>
                <input
                  type="text"
                  name="casteCertificateNo"
                  value={formData.casteCertificateNo}
                  onChange={handleChange}
                  placeholder="Caste Cert No"
                  className="awas-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  INCOME CERTIFICATE NO.
                </label>
                <input
                  type="text"
                  name="incomeCertificateNo"
                  value={formData.incomeCertificateNo}
                  onChange={handleChange}
                  placeholder="Income Cert No"
                  className="awas-input"
                />
              </div>
            </div>
          </section>

          {/* SECTION 3: ADDRESS DETAILS */}
          <section className="space-y-4">
            <div className="awas-section-header">
              3. ADDRESS DETAILS / पता विवरण
            </div>

            {/* Present Address Subheader */}
            <div className="awas-subheader">
              PRESENT ADDRESS / वर्तमान पता
            </div>

            <div className="grid grid-cols-1 sm-grid-cols-2 md-grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  HOUSE NO. / PLOT NO.
                </label>
                <input
                  type="text"
                  name="presentHouseNo"
                  value={formData.presentHouseNo}
                  onChange={handleChange}
                  placeholder="House or Plot No"
                  className="awas-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  STREET / COLONY / WARD
                </label>
                <input
                  type="text"
                  name="presentStreet"
                  value={formData.presentStreet}
                  onChange={handleChange}
                  placeholder="Street or Colony Name"
                  className="awas-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  VILLAGE / TOWN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="presentVillageTown"
                  value={formData.presentVillageTown}
                  onChange={handleChange}
                  placeholder="Village or Town Name"
                  className="awas-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  POST OFFICE
                </label>
                <input
                  type="text"
                  name="presentPostOffice"
                  value={formData.presentPostOffice}
                  onChange={handleChange}
                  placeholder="Post Office Name"
                  className="awas-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  TEHSIL / TALUKA <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="presentTehsil"
                  value={formData.presentTehsil}
                  onChange={handleChange}
                  placeholder="Tehsil or Block"
                  className="awas-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  DISTRICT <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="presentDistrict"
                  value={formData.presentDistrict}
                  onChange={handleChange}
                  placeholder="District Name"
                  className="awas-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  STATE <span className="text-red-500">*</span>
                </label>
                <select
                  name="presentState"
                  value={formData.presentState}
                  onChange={handleChange}
                  className="awas-select"
                  required
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  PIN CODE <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="presentPinCode"
                  value={formData.presentPinCode}
                  onChange={handleChange}
                  placeholder="6-digit PIN"
                  maxLength={6}
                  className="awas-input"
                  required
                />
              </div>
            </div>

            {/* Checkbox for copying address */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  name="sameAsPresent"
                  checked={formData.sameAsPresent}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-blue-600"
                />
                <span>Permanent address same as above / स्थायी पता उपरोक्त अनुसार</span>
              </label>
            </div>

            {/* Permanent Address Subheader */}
            <div className="awas-subheader pt-3">
              PERMANENT ADDRESS / स्थायी पता
            </div>

            <div className="grid grid-cols-1 sm-grid-cols-2 md-grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  HOUSE NO. / PLOT NO.
                </label>
                <input
                  type="text"
                  name="permanentHouseNo"
                  value={formData.permanentHouseNo}
                  onChange={handleChange}
                  readOnly={formData.sameAsPresent}
                  placeholder="House or Plot No"
                  className={`awas-input ${formData.sameAsPresent ? 'bg-slate-100' : ''}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  STREET / COLONY / WARD
                </label>
                <input
                  type="text"
                  name="permanentStreet"
                  value={formData.permanentStreet}
                  onChange={handleChange}
                  readOnly={formData.sameAsPresent}
                  placeholder="Street or Colony Name"
                  className={`awas-input ${formData.sameAsPresent ? 'bg-slate-100' : ''}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  VILLAGE / TOWN
                </label>
                <input
                  type="text"
                  name="permanentVillageTown"
                  value={formData.permanentVillageTown}
                  onChange={handleChange}
                  readOnly={formData.sameAsPresent}
                  placeholder="Village or Town Name"
                  className={`awas-input ${formData.sameAsPresent ? 'bg-slate-100' : ''}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  POST OFFICE
                </label>
                <input
                  type="text"
                  name="permanentPostOffice"
                  value={formData.permanentPostOffice}
                  onChange={handleChange}
                  readOnly={formData.sameAsPresent}
                  placeholder="Post Office Name"
                  className={`awas-input ${formData.sameAsPresent ? 'bg-slate-100' : ''}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  TEHSIL / TALUKA
                </label>
                <input
                  type="text"
                  name="permanentTehsil"
                  value={formData.permanentTehsil}
                  onChange={handleChange}
                  readOnly={formData.sameAsPresent}
                  placeholder="Tehsil or Block"
                  className={`awas-input ${formData.sameAsPresent ? 'bg-slate-100' : ''}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  DISTRICT
                </label>
                <input
                  type="text"
                  name="permanentDistrict"
                  value={formData.permanentDistrict}
                  onChange={handleChange}
                  readOnly={formData.sameAsPresent}
                  placeholder="District Name"
                  className={`awas-input ${formData.sameAsPresent ? 'bg-slate-100' : ''}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  STATE
                </label>
                <select
                  name="permanentState"
                  value={formData.permanentState}
                  onChange={handleChange}
                  disabled={formData.sameAsPresent}
                  className={`awas-select ${formData.sameAsPresent ? 'bg-slate-100' : ''}`}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  PIN CODE
                </label>
                <input
                  type="text"
                  name="permanentPinCode"
                  value={formData.permanentPinCode}
                  onChange={handleChange}
                  readOnly={formData.sameAsPresent}
                  placeholder="6-digit PIN"
                  maxLength={6}
                  className={`awas-input ${formData.sameAsPresent ? 'bg-slate-100' : ''}`}
                />
              </div>
            </div>
          </section>

          {/* SECTION 4: FAMILY / HOUSEHOLD DETAILS */}
          <section className="space-y-4">
            <div className="awas-section-header">
              4. FAMILY / HOUSEHOLD DETAILS / परिवार विवरण
            </div>

            <div className="grid grid-cols-1 sm-grid-cols-2 md-grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  TOTAL FAMILY MEMBERS <span className="text-red-500">*</span>
                </label>
                <select
                  name="totalFamilyMembers"
                  value={formData.totalFamilyMembers}
                  onChange={handleChange}
                  className="awas-select"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  ANNUAL FAMILY INCOME <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1-2 text-slate-500 text-xs font-semibold">₹</span>
                  <input
                    type="number"
                    name="annualFamilyIncome"
                    value={formData.annualFamilyIncome}
                    onChange={handleChange}
                    placeholder="in rupees"
                    className="awas-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  BPL / APL STATUS <span className="text-red-500">*</span>
                </label>
                <select
                  name="bplAplStatus"
                  value={formData.bplAplStatus}
                  onChange={handleChange}
                  className="awas-select"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="BPL">BPL (Below Poverty Line)</option>
                  <option value="APL">APL (Above Poverty Line)</option>
                  <option value="EWS">EWS (Economically Weaker Section)</option>
                  <option value="LIG">LIG (Low Income Group)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  TYPE OF RESIDENCE
                </label>
                <select
                  name="typeOfResidence"
                  value={formData.typeOfResidence}
                  onChange={handleChange}
                  className="awas-select"
                >
                  <option value="">Select Residence Type</option>
                  <option value="Kutcha House">Kutcha House (Kachha)</option>
                  <option value="Semi-Pucca">Semi-Pucca</option>
                  <option value="Rented">Rented Room</option>
                  <option value="Homeless">Homeless / No Land</option>
                  <option value="Pucca">Pucca House</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  LAND HOLDING (ACRES)
                </label>
                <input
                  type="text"
                  name="landHoldingAcres"
                  value={formData.landHoldingAcres}
                  onChange={handleChange}
                  placeholder="0 if none"
                  className="awas-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  NO. OF DEPENDENTS
                </label>
                <select
                  name="noOfDependents"
                  value={formData.noOfDependents}
                  onChange={handleChange}
                  className="awas-select"
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  NO. OF CHILDREN
                </label>
                <select
                  name="noOfChildren"
                  value={formData.noOfChildren}
                  onChange={handleChange}
                  className="awas-select"
                >
                  {[0, 1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  PRIMARY EARNING MEMBER
                </label>
                <input
                  type="text"
                  name="primaryEarningMember"
                  value={formData.primaryEarningMember}
                  onChange={handleChange}
                  placeholder="Name of Earner"
                  className="awas-input"
                />
              </div>
            </div>
          </section>

          {/* SECTION 5: OCCUPATION & BANK DETAILS */}
          <section className="space-y-4">
            <div className="awas-section-header">
              5. OCCUPATION & BANK DETAILS / व्यवसाय एवं बैंक विवरण
            </div>

            <div className="grid grid-cols-1 sm-grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  OCCUPATION <span className="text-red-500">*</span>
                </label>
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="awas-select"
                  required
                >
                  <option value="">Select Occupation</option>
                  <option value="Daily Labourer">Daily Labourer / मजदूरी</option>
                  <option value="Farmer / Agriculture">Farmer / Kheti</option>
                  <option value="Self Employed / Artisan">Self Employed / Artisan</option>
                  <option value="Salaried Employee">Salaried Employee</option>
                  <option value="Homemaker">Homemaker / गृहिणी</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  EDUCATIONAL QUALIFICATION
                </label>
                <select
                  name="educationalQualification"
                  value={formData.educationalQualification}
                  onChange={handleChange}
                  className="awas-select"
                >
                  <option value="">Select Qualification</option>
                  <option value="Illiterate">Illiterate</option>
                  <option value="Primary (Up to 5th)">Primary School</option>
                  <option value="Secondary (10th Pass)">10th Pass</option>
                  <option value="Higher Secondary (12th Pass)">12th Pass</option>
                  <option value="Graduate & Above">Graduate & Above</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  DISABILITY (IF ANY)
                </label>
                <select
                  name="disability"
                  value={formData.disability}
                  onChange={handleChange}
                  className="awas-select"
                >
                  <option value="None / कोई नहीं">None / कोई नहीं</option>
                  <option value="Physical Disability">Physical Disability</option>
                  <option value="Visual Impairment">Visual Impairment</option>
                  <option value="Hearing / Speech">Hearing / Speech</option>
                  <option value="Multiple Disability">Multiple Disability</option>
                </select>
              </div>
            </div>

            {/* Bank Account Details Subheader */}
            <div className="awas-subheader pt-3">
              BANK ACCOUNT DETAILS / बैंक खाता विवरण
            </div>

            <div className="grid grid-cols-1 sm-grid-cols-2 md-grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  BANK ACCOUNT NUMBER <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  placeholder="Enter Account No"
                  className="awas-input font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  BANK NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="e.g. State Bank of India"
                  className="awas-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  IFSC CODE <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  placeholder="E.g. SBIN0001234"
                  maxLength={11}
                  className="awas-input uppercase font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  BRANCH NAME
                </label>
                <input
                  type="text"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleChange}
                  placeholder="Branch Name"
                  className="awas-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  ACCOUNT HOLDER NAME
                </label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  placeholder="As per passbook"
                  className="awas-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  ACCOUNT TYPE
                </label>
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  className="awas-select"
                >
                  <option value="Savings">Savings Account</option>
                  <option value="Jan Dhan">PM Jan Dhan Account</option>
                  <option value="Current">Current Account</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 6: DOCUMENTS ENCLOSED */}
          <section className="space-y-4">
            <div className="awas-section-header">
              6. DOCUMENTS ENCLOSED / संलग्न दस्तावेज़
            </div>

            {/* Document Checkboxes (12 items matching Screenshot 5) */}
            <div className="grid grid-cols-1 sm-grid-cols-2 md-grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              {DOCUMENT_OPTIONS.map((doc) => {
                const isChecked = formData.enclosedDocuments.includes(doc);
                return (
                  <label
                    key={doc}
                    onClick={() => handleDocumentToggle(doc)}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer hover:text-blue-700 transition"
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span>{doc}</span>
                  </label>
                );
              })}
            </div>

            {/* Date & Place */}
            <div className="grid grid-cols-1 sm-grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  DATE / दिनांक <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="signingDate"
                  value={formData.signingDate}
                  onChange={handleChange}
                  className="awas-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  PLACE / स्थान <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="signingPlace"
                  value={formData.signingPlace}
                  onChange={handleChange}
                  placeholder="Enter place of signing"
                  className="awas-input"
                  required
                />
              </div>
            </div>

            {/* Signatures & Officer Verification Boxes (Matching Screenshot 5) */}
            <div className="grid grid-cols-1 sm-grid-cols-3 gap-4 pt-2">
              
              {/* Signature Box */}
              <div className="flex flex-col items-center">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 w-full text-center">
                  SIGNATURE OF APPLICANT
                </label>
                <label className="upload-box w-full min-h-[110px] flex flex-col items-center justify-center p-3 cursor-pointer">
                  {formData.signaturePreview ? (
                    <img src={formData.signaturePreview} alt="Signature" className="h-16 object-contain" />
                  ) : (
                    <div className="text-center">
                      <span className="text-xs font-semibold text-slate-600 block">Click to Upload Signature</span>
                      <span className="text-xs text-emerald-600 font-bold">Auto-Compressed</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, 'signatureFile', 'signaturePreview')} 
                    className="hidden" 
                  />
                </label>
              </div>

              {/* Thumb Impression Box */}
              <div className="flex flex-col items-center">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 w-full text-center">
                  THUMB IMPRESSION
                </label>
                <label className="upload-box w-full min-h-[110px] flex flex-col items-center justify-center p-3 cursor-pointer">
                  {formData.thumbPreview ? (
                    <img src={formData.thumbPreview} alt="Thumb" className="h-16 object-contain" />
                  ) : (
                    <div className="text-center">
                      <span className="text-xs font-semibold text-slate-600 block">Click to Upload Thumb</span>
                      <span className="text-xs text-emerald-600 font-bold">Auto-Compressed</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, 'thumbFile', 'thumbPreview')} 
                    className="hidden" 
                  />
                </label>
              </div>

              {/* Verified by Officer (Office Use Only) */}
              <div className="flex flex-col items-center">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 w-full text-center">
                  VERIFIED BY OFFICER
                </label>
                <div className="border-2 border-dashed border-slate-300 bg-slate-50 w-full min-h-[110px] rounded-lg flex flex-col items-center justify-center p-3 text-center">
                  <span className="text-xs text-slate-500 font-medium">Authorised Officer</span>
                  <span className="text-xs text-slate-500 font-medium">Stamp / Signature</span>
                </div>
              </div>

            </div>
          </section>

          {/* SECTION 7: DECLARATION */}
          <section className="space-y-4">
            <div className="awas-section-header">
              7. DECLARATION / घोषणा
            </div>

            {/* Declaration Text Box in Yellow (Matching Screenshot 5) */}
            <div className="bg-declaration-yellow border border-declaration-yellow rounded-lg p-4 text-xs text-slate-800 space-y-3 leading-relaxed">
              <p>
                I hereby declare that all the information furnished above is true, correct and complete to the best of my knowledge and belief. I am aware that furnishing false information is liable to action under relevant provisions of law and the benefit granted on the basis of false information shall be recovered from me.
              </p>
              <p className="font-semibold text-slate-900 border-t border-amber-200 pt-2">
                मैं एतद्द्वारा घोषणा करता/करती हूँ कि ऊपर दी गई सभी जानकारी सत्य, सही एवं पूर्ण हैं। मैं जानता/जानती हूँ कि गलत जानकारी देने पर कानूनी कार्रवाई की जा सकती है।
              </p>
            </div>

            {/* Agreement Checkbox */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  name="agreedDeclaration"
                  checked={formData.agreedDeclaration}
                  onChange={handleChange}
                  className="rounded border-slate-400 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  required
                />
                <span>I agree to the above declaration / मैं उपरोक्त घोषणा से सहमत हूँ <span className="text-red-500">*</span></span>
              </label>
            </div>

            {/* Office Use Only Box (Matching Screenshot 5) */}
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 bg-slate-50 text-xs text-slate-500 space-y-2">
              <div className="font-bold text-slate-700 tracking-wider uppercase text-xs text-center">
                FOR OFFICE USE ONLY
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div>Application No: ____________________</div>
                <div>Received by: ____________________</div>
                <div>Date: ____________________</div>
              </div>
            </div>

          </section>

          {/* Bottom Action Buttons (Matching Screenshot 5) */}
          <div className="no-print pt-6 border-t border-slate-200 flex flex-wrap items-center justify-center sm-justify-end gap-3">
            
            {/* Print Form Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="btn-outline text-xs px-5 py-2-5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Form</span>
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              className="btn-danger-outline text-xs px-5 py-2-5 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>

            {/* Submit Application Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs px-6 py-2-5 shadow-md hover:shadow-lg transition-all"
            >
              {loading ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <span>Submit Application</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>

          </div>

        </form>

      </div>

      {/* Footer Caption */}
      <div className="no-print text-center text-xs text-slate-500 mt-4">
        © Awas India | ASWA Yojana Portal | Helpline: 1800-XXX-XXXX
      </div>

    </div>
  );
};
