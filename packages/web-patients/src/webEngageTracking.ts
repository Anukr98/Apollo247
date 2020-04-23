//PHR Consult & RX
export const phrConsultTabClickTracking = (userData: any) => {
    if (window.webengage) {
        const { id, mobileNumber, firstName, relation, gender, age, uhid } = userData;
        window.webengage.track("PHR Consult & RX", {
            "Patient Name": firstName,
            "Patient UHID": uhid,
            "Relation": relation,
            "Gender": gender,
            "Mobile Number": mobileNumber,
            "Customer ID": id,
            "Age": age
        });
    }
};
//PHR Medical Records
export const phrMedicalRecordsTabClickTracking = (userData: any) => {
    if (window.webengage) {
        const { id,
            mobileNumber,
            firstName,
            relation,
            gender,
            uhid,
            age
        } = userData;
        window.webengage.track("PHR Medical Records", {
            "Patient Name": firstName,
            "Patient UHID": uhid,
            "Relation": relation,
            "Gender": gender,
            "Mobile Number": mobileNumber,
            "Customer ID": id,
            "Age": age
        });
    }
};
//Add Record
export const addRecordClickTracking = (source: string) => {
    // Consult & RX/ Medical Record
    window.webengage.track("Add Record", {
        Source: source
    })
}
//Upload Prescription
export const uploadPrescriptionTracking = (data: any) => {
    const { id, mobileNumber, firstName, relation, age, gender, uhid } = data;
    window.webengage.track("Upload Prescription", {
        "Patient Name": firstName,
        "Patient UHID": uhid,
        "Relation": relation,
        "Age": age,
        "Gender": gender,
        "Mobile Number": mobileNumber,
        "Customer ID": id
    })
}
//Upload Photo
export const uploadPhotoTracking = (source: string) => {
    window.webengage.track("Upload Photo", {
        Source: source //Take Photo/Gallery
    })
}
//Items Clicked
export const itemsClickedTracking = (data: any) => {
    const { source, type } = data;
    window.webengage.track("Items Clicked", {
        Source: source, //Consult/Medical
        Type: type //Prescription/Test Result
    })
}
//PHR Consult Card click 
export const phrConsultCardClickTracking = (data: any) => {
    if (window.webenage) {
        const { id,
            mobileNumber,
            firstName,
            relation,
            gender,
            uhid,
            age,
            consultId } = data;
        window.webengage.track("PHR Consult Card click", {
            "Patient Name": firstName,
            "Patient UHID": uhid,
            "Relation": relation,
            "Gender": gender,
            Age: age,
            "Mobile Number": mobileNumber,
            "Customer ID": id,
            "Consult ID": consultId
        });
    }

} 