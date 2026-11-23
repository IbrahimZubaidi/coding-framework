from psycopg.rows import dict_row
from fastapi import APIRouter, Depends

from controls import db
from controls.auth import get_student
from controls.responses import success_response, error_response

router = APIRouter()


@router.get("/me")
async def read_me(
    student=Depends(get_student),
    conn=Depends(db.get_db_conn_dep),
):
    user_id = student['user_id']

    query = """
        SELECT
            u.id,
            u.name,
            u.email,
            u.is_banned
        FROM users u
        WHERE u.id = %s
    """

    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(query, (user_id,))
            user = await cur.fetchone()

        if not user:
            return error_response("invalid credentials", status_code=401)

        if user['is_banned']:
            return error_response("your account has been banned", status_code=401)

        return success_response({
            'id'   : user['id'],
            'name' : user['name'],
            'email': user['email'],
        })

    except Exception as e:
        return error_response(str(e), status_code=500, exc=e)
