# /user
GETS user information on the currently logged in user including name, email, username, etc.
Example output:

```
{
  "username": "firstlast",
  "email": "firstlast@email.com",
  "first_name": "First",
  "id": 1234,
  "last_name": "Last",
  "organization": "Cool Place"
}
```

# /resources
GETS list of user resources on HydroShare ({'resources':resources})
Example output:

```

```

#/resources/<resource_id>/hsfiles
GETs list of files that are in a user's HS instance of a resource with the given resource_id ({'files':res})
Example output:

#/resources/<resource_id>/local-files
GETs list of files that are in a user's JH isntance of a resource with the give resource_id ({'files':res})
Example output:

