export async function GET() {

  try {

    const response = await fetch(
      "https://pockethrmsapi.azurewebsites.net/api/EmployeeMaster/GetEmployeeMaster",
      {
        method: "GET",
        headers: {
          Authorization: "h86ydGjdMZmmwxdcggli8mad2ponydcikazPzBz4Ido=",

          EmployeeFields:
            "FNAME,COP,DepartmentString,DesignationString",

          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    // Safe check

    if (!Array.isArray(data)) {

      return Response.json([]);

    }

    // Clean data

    const employees = data.map((emp) => ({

      name: emp.FName || "",

      account: emp.COP || "",

      department: emp.DepartmentString || "",

      designation: emp.DesignationString || "",

    }));

    return Response.json(employees);

  } catch (error) {

    console.log(error);

    return Response.json(
      {
        error: "Failed to fetch employees",
        details: error.message,
      },
      {
        status: 500,
      }
    );

  }
}