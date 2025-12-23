// PatientData.js

// Full individual patient detailed data
const patients = [
  {
    id: "#P001",
    name: "Vanitha G",
    age: "23 years",
    gender: "Female",
    phone: "+91 9876543210",
    email: "vanitha.g@email.com",
    address: "Madhavardhini Vidya",
    lastVisit: "March 15, 2024",
    nextVisit: "July 7, 2025",
  },
  {
    id: "#P002",
    name: "Rahul Sharma",
    age: "35 years",
    gender: "Male",
    phone: "+91 9123456780",
    email: "rahul.sharma@email.com",
    address: "123 MG Road, Hyderabad",
    lastVisit: "April 20, 2024",
    nextVisit: "August 12, 2025",
  },
  {
    id: "#P003",
    name: "Saranya Iyer",
    age: "42 years",
    gender: "Female",
    phone: "+91 9988776655",
    email: "saranya.iyer@email.com",
    address: "456 Lakeview Avenue, Chennai",
    lastVisit: "May 12, 2024",
    nextVisit: "September 18, 2025",
  },
  {
    id: "#P004",
    name: "Nikhil Reddy",
    age: "29 years",
    gender: "Male",
    phone: "+91 9876549870",
    email: "nikhil.reddy@email.com",
    address: "789 Greenpark Road, Bengaluru",
    lastVisit: "June 5, 2024",
    nextVisit: "October 22, 2025",
  },
  {
    id: "#P005",
    name: "Priya Kumar",
    age: "31 years",
    gender: "Female",
    phone: "+91 9900112233",
    email: "priya.kumar@email.com",
    address: "12 Lotus Street, Mumbai",
    lastVisit: "July 10, 2024",
    nextVisit: "November 15, 2025",
  },
  {
    id: "#P006",
    name: "Ravi Teja",
    age: "27 years",
    gender: "Male",
    phone: "+91 9555667788",
    email: "ravi.teja@email.com",
    address: "34 Beach Road, Vizag",
    lastVisit: "August 2, 2024",
    nextVisit: "December 5, 2025",
  },
  {
    id: "#P007",
    name: "Sneha Patil",
    age: "38 years",
    gender: "Female",
    phone: "+91 9666778899",
    email: "sneha.patil@email.com",
    address: "55 Sunrise Colony, Pune",
    lastVisit: "September 18, 2024",
    nextVisit: "January 22, 2026",
  },
  {
    id: "#P008",
    name: "Arjun Mehta",
    age: "40 years",
    gender: "Male",
    phone: "+91 9444556677",
    email: "arjun.mehta@email.com",
    address: "21 Central Park, Delhi",
    lastVisit: "October 12, 2024",
    nextVisit: "February 28, 2026",
  },
  {
    id: "#P009",
    name: "Divya Singh",
    age: "24 years",
    gender: "Female",
    phone: "+91 9888776655",
    email: "divya.singh@email.com",
    address: "8 Garden View, Lucknow",
    lastVisit: "November 6, 2024",
    nextVisit: "March 14, 2026",
  },
  {
    id: "#P010",
    name: "Amit Verma",
    age: "33 years",
    gender: "Male",
    phone: "+91 9777888999",
    email: "amit.verma@email.com",
    address: "67 Hill Top, Jaipur",
    lastVisit: "December 1, 2024",
    nextVisit: "April 10, 2026",
  },
  {
    id: "#P011",
    name: "Meera Joshi",
    age: "45 years",
    gender: "Female",
    phone: "+91 9666554433",
    email: "meera.joshi@email.com",
    address: "15 Pearl Street, Kochi",
    lastVisit: "January 18, 2025",
    nextVisit: "May 25, 2026",
  },
  {
    id: "#P012",
    name: "Vikram Chatterjee",
    age: "37 years",
    gender: "Male",
    phone: "+91 9333222111",
    email: "vikram.chatterjee@email.com",
    address: "101 Lake Road, Kolkata",
    lastVisit: "February 8, 2025",
    nextVisit: "June 12, 2026",
  },
  {
    id: "#P013",
    name: "Aisha Khan",
    age: "30 years",
    gender: "Female",
    phone: "+91 9555443322",
    email: "aisha.khan@email.com",
    address: "18 Crescent Road, Bhopal",
    lastVisit: "March 3, 2025",
    nextVisit: "July 20, 2026",
  },
  {
    id: "#P014",
    name: "Siddharth Rao",
    age: "26 years",
    gender: "Male",
    phone: "+91 9223344556",
    email: "siddharth.rao@email.com",
    address: "202 Skyline, Hyderabad",
    lastVisit: "March 25, 2025",
    nextVisit: "August 2, 2026",
  },
  {
    id: "#P015",
    name: "Krishna Patel",
    age: "34 years",
    gender: "Female",
    phone: "+91 9112233445",
    email: "krishna.patel@email.com",
    address: "99 Harmony Apartments, Surat",
    lastVisit: "April 14, 2025",
    nextVisit: "September 8, 2026",
  }
];


// Medical History for demonstration
const medicalHistory = [
  { condition: "Tooth Cavity", status: "Active" },
  { condition: "Tooth Periodontitis", status: "Treated" },
  { condition: "Tonsillitis", status: "Ongoing" },
  { condition: "Dry Eye", status: "Ongoing" }
];

// Payment History
const paymentHistory = [
  { date: "Jul 7, 2024", amount: "$90", status: "Paid", method: "Manual" },
  { date: "Jun 15, 2024", amount: "$150", status: "Paid", method: "Card" }
];

// Appointments
const appointments = [
  {
    id: 1,
    title: "Regular Checkup",
    date: "Next Appointment",
    time: "March 15, 2024 | 3:00 PM - 4:00 PM",
    status: "Scheduled",
    type: "Checkup"
  },
  {
    id: 2,
    title: "Teeth Cleaning",
    date: "Previous Appointment",
    time: "February 20, 2024 | 2:00 PM - 3:00 PM",
    status: "Completed",
    type: "Cleaning"
  }
];

// Medications
const medications = [
  {
    name: "Ibuprofen 400mg",
    dosage: "Take 3 times daily",
    status: "Active"
  },
  {
    name: "Amoxicillin 500mg",
    dosage: "Take 2 times daily",
    status: "Ongoing"
  }
];

// Encounters
const encounters = [
  {
    date: "March 15, 2024",
    type: "Routine Cleaning",
    description: "Complete dental cleaning and examination. No issues found. Dr. Saranya."
  },
  {
    date: "February 20, 2024",
    type: "Cavity Treatment",
    description: "Treated cavity on upper right molar. Filling applied successfully. Dr. Ranjith"
  }
];

// Treatment Progress
const treatmentProgress = {
  cavityTreatment: 75,
  oralHygiene: 85,
  overallHealth: 60
};

// Dental Photos
const dentalPhotos = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Teeth_by_David_Shankbone.jpg/960px-Teeth_by_David_Shankbone.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/d/db/06-10-06smile.jpg"
];

export {
  patients,           // ✅ Main patient list for PatientTable
  medicalHistory,
  paymentHistory,
  appointments,
  medications,
  encounters,
  treatmentProgress,
  dentalPhotos
};
