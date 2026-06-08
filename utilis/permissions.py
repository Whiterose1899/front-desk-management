from utilis.dependencies import get_current_user
from fastapi import HTTPException, Depends

def admin_access(user = Depends(get_current_user)):
    if user["role"] != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Admin privileges required."
        )
    return user
    
def manager_or_admin_access(user = Depends(get_current_user)):
    if user["role"] not in ["Admin", "Manager"]:
        raise HTTPException(
            status_code=403,
            detail="User Above Manager Privileges Required."
        )
    return user