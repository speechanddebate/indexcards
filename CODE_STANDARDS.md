
# API Code Standards

## Endpoints

### GET Requests
- **Purpose**: Retrieve data
- **Response**: JSON object or array
- **Status Codes**: 200 (OK), 404 (Not Found), 400 (Bad Request)

### POST Requests
- **Purpose**: Create new resources
- **Request Body**: JSON payload
- **Response**: Created resource with ID
- **Status Codes**: 201 (Created), 400 (Bad Request), 409 (Conflict)

### PUT Requests
- **Purpose**: Update existing resources
- **Request Body**: Complete resource JSON
- **Response**: Updated resource
- **Status Codes**: 200 (OK), 400 (Bad Request), 404 (Not Found)

### DELETE Requests
- **Purpose**: Remove resources
- **Response**: 204 (No Content) or confirmation message
- **Status Codes**: 204 (No Content), 404 (Not Found)

### Error Responses
- **Format** all error responses should conform to the problem details format

## Repos

### Get
- all 'opts.include' objects should be attached in capital notation (ex: category.Events)

### Create
- all create methods should return the newly created object id
### Update 
- all update methods should return the updated object id
### Delete
all delete methods should return true if a row was deleted, false otherwise