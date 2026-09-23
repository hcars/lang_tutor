use pest::Parser;
use pest_derive::Parser;

use crate::models::*;

#[derive(Parser)]
#[grammar = "grammar.pest"]
struct ClimbingDslParser;

pub fn parse_workout(input: &str) -> Result<WorkoutParseResult, String> {
    let pairs = ClimbingDslParser::parse(Rule::program, input)
        .map_err(|e| format!("Parse error: {e}"))?;

    let mut variables = Vec::new();
    let mut exercises = Vec::new();

    for pair in pairs {
        match pair.as_rule() {
            Rule::program => {
                for inner in pair.into_inner() {
                    match inner.as_rule() {
                        Rule::variable_block => {
                            variables.extend(parse_variable_block(inner)?);
                        }
                        Rule::exercise_block => {
                            exercises.push(parse_exercise_block(inner)?);
                        }
                        _ => {}
                    }
                }
            }
            _ => {}
        }
    }

    Ok(WorkoutParseResult {
        variables,
        exercises,
    })
}

fn parse_variable_block(
    pair: pest::iterators::Pair<Rule>,
) -> Result<Vec<Variable>, String> {
    let mut vars = Vec::new();
    for inner in pair.into_inner() {
        if inner.as_rule() == Rule::variable_decl {
            vars.push(parse_variable_decl(inner)?);
        }
    }
    Ok(vars)
}

fn parse_variable_decl(pair: pest::iterators::Pair<Rule>) -> Result<Variable, String> {
    let mut inner = pair.into_inner();
    let name = inner
        .next()
        .ok_or("Missing variable name")?
        .as_str()
        .to_string();

    let value_pair = inner.next().ok_or("Missing variable value")?;
    let (value, unit, rate, sign) = parse_value_expr(value_pair)?;

    Ok(Variable {
        name,
        value,
        unit,
        rate,
        sign,
    })
}

fn parse_value_expr(
    pair: pest::iterators::Pair<Rule>,
) -> Result<(f64, Option<String>, Option<String>, Option<String>), String> {
    let mut sign_val = None;
    let mut number_val = 0.0;
    let mut unit_val = None;
    let mut rate_val = None;

    for inner in pair.into_inner() {
        match inner.as_rule() {
            Rule::sign => {
                sign_val = Some(inner.as_str().to_string());
            }
            Rule::number => {
                number_val = inner
                    .as_str()
                    .parse::<f64>()
                    .map_err(|e| format!("Invalid number: {e}"))?;
            }
            Rule::unit => {
                unit_val = Some(inner.as_str().to_string());
            }
            Rule::rate => {
                for r in inner.into_inner() {
                    if r.as_rule() == Rule::rate_period {
                        rate_val = Some(r.as_str().to_string());
                    }
                }
            }
            _ => {}
        }
    }

    if sign_val.as_deref() == Some("-") {
        number_val = -number_val;
    }

    Ok((number_val, unit_val, rate_val, sign_val))
}

fn parse_exercise_block(
    pair: pest::iterators::Pair<Rule>,
) -> Result<Exercise, String> {
    let mut name = String::new();
    let mut load = None;
    let mut volume = None;
    let mut grade = None;
    let rpe = None;

    for inner in pair.into_inner() {
        match inner.as_rule() {
            Rule::exercise_header => {
                for p in inner.into_inner() {
                    if p.as_rule() == Rule::exercise_name {
                        name = p.as_str().trim().to_string();
                    }
                }
            }
            Rule::load_prop => {
                for p in inner.into_inner() {
                    if p.as_rule() == Rule::load_expr {
                        load = Some(parse_load_expr(p)?);
                    }
                }
            }
            Rule::grade_prop => {
                for p in inner.into_inner() {
                    if p.as_rule() == Rule::grade_val {
                        grade = Some(p.as_str().to_string());
                    }
                }
            }
            Rule::volume_prop => {
                for p in inner.into_inner() {
                    if p.as_rule() == Rule::volume_expr {
                        volume = Some(parse_volume_expr(p)?);
                    }
                }
            }
            _ => {}
        }
    }

    Ok(Exercise {
        name,
        properties: ExerciseProperties {
            load,
            volume,
            grade,
            rpe,
        },
    })
}

fn parse_load_expr(pair: pest::iterators::Pair<Rule>) -> Result<LoadSpec, String> {
    let mut terms = Vec::new();
    let mut expr_parts = Vec::new();

    for inner in pair.into_inner() {
        match inner.as_rule() {
            Rule::load_term => {
                let term = parse_load_term(inner.clone())?;
                expr_parts.push(inner.as_str().trim().to_string());
                terms.push(term);
            }
            Rule::load_op => {
                let op = inner.as_str().to_string();
                expr_parts.push(op.clone());
                terms.push(LoadTerm::Operator { op });
            }
            _ => {}
        }
    }

    Ok(LoadSpec {
        expression: expr_parts.join(" "),
        terms,
    })
}

fn parse_load_term(pair: pest::iterators::Pair<Rule>) -> Result<LoadTerm, String> {
    let inner = pair
        .into_inner()
        .next()
        .ok_or("Empty load term")?;

    match inner.as_rule() {
        Rule::pct_ref => {
            let mut parts = inner.into_inner();
            let pct = parts
                .next()
                .ok_or("Missing percentage")?
                .as_str()
                .parse::<f64>()
                .map_err(|e| format!("Invalid percentage: {e}"))?;
            let var = parts
                .next()
                .ok_or("Missing variable ref")?
                .as_str()
                .to_string();
            Ok(LoadTerm::PercentageRef {
                percentage: pct,
                variable: var,
            })
        }
        Rule::identifier => Ok(LoadTerm::VariableRef {
            name: inner.as_str().to_string(),
        }),
        Rule::literal_val => {
            let mut sign_val: Option<String> = None;
            let mut num = 0.0;
            let mut unit_val = None;
            for p in inner.into_inner() {
                match p.as_rule() {
                    Rule::sign => sign_val = Some(p.as_str().to_string()),
                    Rule::number => {
                        num = p
                            .as_str()
                            .parse::<f64>()
                            .map_err(|e| format!("Invalid number: {e}"))?;
                    }
                    Rule::unit => unit_val = Some(p.as_str().to_string()),
                    _ => {}
                }
            }
            if sign_val.as_deref() == Some("-") {
                num = -num;
            }
            Ok(LoadTerm::Literal {
                value: num,
                unit: unit_val,
            })
        }
        _ => Err(format!("Unexpected rule in load_term: {:?}", inner.as_rule())),
    }
}

fn parse_volume_expr(pair: pest::iterators::Pair<Rule>) -> Result<VolumeSpec, String> {
    let inner = pair
        .into_inner()
        .next()
        .ok_or("Empty volume expression")?;

    match inner.as_rule() {
        Rule::time_volume => parse_time_volume(inner),
        Rule::rep_volume => parse_rep_volume(inner),
        _ => Err(format!(
            "Unexpected volume rule: {:?}",
            inner.as_rule()
        )),
    }
}

fn parse_time_volume(pair: pest::iterators::Pair<Rule>) -> Result<VolumeSpec, String> {
    let mut durations = Vec::new();
    let mut sets = 0u32;

    for inner in pair.into_inner() {
        match inner.as_rule() {
            Rule::duration => {
                durations.push(parse_duration(inner)?);
            }
            Rule::number => {
                sets = inner
                    .as_str()
                    .parse::<u32>()
                    .map_err(|e| format!("Invalid sets count: {e}"))?;
            }
            _ => {}
        }
    }

    if durations.len() < 2 {
        return Err("Time volume requires hang and rest durations".to_string());
    }

    Ok(VolumeSpec::TimeBased {
        hang_duration: durations.remove(0),
        rest_duration: durations.remove(0),
        sets,
    })
}

fn parse_rep_volume(pair: pest::iterators::Pair<Rule>) -> Result<VolumeSpec, String> {
    let mut count = 0u32;
    let mut rep_type = String::new();
    let mut rpe_val = None;

    for inner in pair.into_inner() {
        match inner.as_rule() {
            Rule::number => {
                count = inner
                    .as_str()
                    .parse::<u32>()
                    .map_err(|e| format!("Invalid rep count: {e}"))?;
            }
            Rule::rep_keyword => {
                rep_type = inner.as_str().to_string();
            }
            Rule::rpe_clause => {
                for p in inner.into_inner() {
                    if p.as_rule() == Rule::number {
                        rpe_val = Some(
                            p.as_str()
                                .parse::<f64>()
                                .map_err(|e| format!("Invalid RPE: {e}"))?,
                        );
                    }
                }
            }
            _ => {}
        }
    }

    Ok(VolumeSpec::RepBased {
        count,
        rep_type,
        rpe: rpe_val,
    })
}

fn parse_duration(pair: pest::iterators::Pair<Rule>) -> Result<Duration, String> {
    let mut value = 0.0;
    let mut unit = String::new();

    for inner in pair.into_inner() {
        match inner.as_rule() {
            Rule::number => {
                value = inner
                    .as_str()
                    .parse::<f64>()
                    .map_err(|e| format!("Invalid duration: {e}"))?;
            }
            Rule::time_unit => {
                unit = inner.as_str().to_string();
            }
            _ => {}
        }
    }

    Ok(Duration { value, unit })
}
