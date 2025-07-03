use anyhow::Result;
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, TokenData, Validation};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String, // user_id
    pub email: String,
    pub exp: i64,
    pub iat: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub email: String,
    pub password_hash: String,
    pub created_at: chrono::DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: UserResponse,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: String,
    pub email: String,
}

const JWT_SECRET: &str = "your-secret-key-change-in-production";

#[derive(Clone)]
pub struct AuthService {
    users: Arc<Mutex<HashMap<String, User>>>, // email -> user
}

impl AuthService {
    pub fn new() -> Self {
        Self {
            users: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn register(&self, req: RegisterRequest) -> Result<AuthResponse> {
        let mut users = self.users.lock().unwrap();
        
        if users.contains_key(&req.email) {
            return Err(anyhow::anyhow!("User already exists"));
        }

        let password_hash = hash(&req.password, DEFAULT_COST)?;
        let user_id = Uuid::new_v4().to_string();
        
        let user = User {
            id: user_id.clone(),
            email: req.email.clone(),
            password_hash,
            created_at: Utc::now(),
        };

        users.insert(req.email.clone(), user.clone());
        
        let token = self.generate_token(&user)?;
        
        Ok(AuthResponse {
            token,
            user: UserResponse {
                id: user.id,
                email: user.email,
            },
        })
    }

    pub fn login(&self, req: LoginRequest) -> Result<AuthResponse> {
        let users = self.users.lock().unwrap();
        
        let user = users.get(&req.email)
            .ok_or_else(|| anyhow::anyhow!("Invalid credentials"))?;

        if !verify(&req.password, &user.password_hash)? {
            return Err(anyhow::anyhow!("Invalid credentials"));
        }

        let token = self.generate_token(user)?;
        
        Ok(AuthResponse {
            token,
            user: UserResponse {
                id: user.id.clone(),
                email: user.email.clone(),
            },
        })
    }

    pub fn verify_token(&self, token: &str) -> Result<Claims> {
        let token_data: TokenData<Claims> = decode(
            token,
            &DecodingKey::from_secret(JWT_SECRET.as_ref()),
            &Validation::default(),
        )?;

        Ok(token_data.claims)
    }

    fn generate_token(&self, user: &User) -> Result<String> {
        let now = Utc::now();
        let exp = now + Duration::hours(24);
        
        let claims = Claims {
            sub: user.id.clone(),
            email: user.email.clone(),
            exp: exp.timestamp(),
            iat: now.timestamp(),
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(JWT_SECRET.as_ref()),
        )?;

        Ok(token)
    }

    pub fn get_user_by_id(&self, user_id: &str) -> Option<User> {
        let users = self.users.lock().unwrap();
        users.values().find(|u| u.id == user_id).cloned()
    }
} 