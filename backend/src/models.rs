use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkoutParseResult {
    pub variables: Vec<Variable>,
    pub exercises: Vec<Exercise>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Variable {
    pub name: String,
    pub value: f64,
    pub unit: Option<String>,
    pub rate: Option<String>,
    pub sign: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Exercise {
    pub name: String,
    pub properties: ExerciseProperties,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExerciseProperties {
    pub load: Option<LoadSpec>,
    pub volume: Option<VolumeSpec>,
    pub grade: Option<String>,
    pub rpe: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoadSpec {
    pub expression: String,
    pub terms: Vec<LoadTerm>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum LoadTerm {
    PercentageRef { percentage: f64, variable: String },
    VariableRef { name: String },
    Literal { value: f64, unit: Option<String> },
    Operator { op: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum VolumeSpec {
    TimeBased {
        hang_duration: Duration,
        rest_duration: Duration,
        sets: u32,
    },
    RepBased {
        count: u32,
        rep_type: String,
        rpe: Option<f64>,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Duration {
    pub value: f64,
    pub unit: String,
}

#[derive(Debug, Deserialize)]
pub struct ParseRequest {
    pub input: String,
}

#[derive(Debug, Serialize)]
pub struct ParseResponse {
    pub success: bool,
    pub data: Option<WorkoutParseResult>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessTokenClaims {
    pub sub: String,
    pub email: Option<String>,
    pub username: Option<String>,
    pub issuer: Option<String>,
    pub expires_at: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct SessionResponse {
    pub authenticated: bool,
    pub user: SessionUser,
}

#[derive(Debug, Serialize)]
pub struct SessionUser {
    pub subject: String,
    pub email: Option<String>,
}
