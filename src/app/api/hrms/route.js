export async function GET() {

  try {

    const response = await fetch(
      "https://pockethrmsapi.azurewebsites.net/api/EmployeeMaster/GetEmployeeMaster",
      {
        method: "GET",

        headers: {
          Authorization:
            "h86ydGjdMZmmwxdcggli8mad2ponydcikazPzBz4Ido=",

          "Content-Type": "application/json",

          EmployeeFields:
           "CODE,FNAME,EMAIL,PERSONALEMAIL",
        },
      }
    );

    const data = await response.json();

    // Clean Employee Data

    const employees = data.map((emp) => ({
      id: emp.Code,
      name: emp.FName,
      email: emp.Email,
      personalEmail: emp.PersonalEmail,
    }));

    return Response.json(employees);

  } catch (error) {

    console.log(error);

    return Response.json({
      error: "Failed to fetch employees",
    });
  }
}