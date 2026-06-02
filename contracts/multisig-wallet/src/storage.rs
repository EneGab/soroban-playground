// Copyright (c) 2026 StellarDevTools
// SPDX-License-Identifier: MIT

use soroban_sdk::{Address, Env};

use crate::types::{DataKey, Error, InstanceKey, Transaction};

// ── Initialisation guard ──────────────────────────────────────────────────────

pub fn is_initialized(env: &Env) -> bool {
    env.storage().instance().has(&InstanceKey::Initialized)
}

pub fn set_initialized(env: &Env) {
    env.storage().instance().set(&InstanceKey::Initialized, &true);
}

// ── Threshold ─────────────────────────────────────────────────────────────────

pub fn set_threshold(env: &Env, t: u32) {
    env.storage().instance().set(&InstanceKey::Threshold, &t);
}

pub fn get_threshold(env: &Env) -> u32 {
    env.storage()
        .instance()
        .get(&InstanceKey::Threshold)
        .unwrap_or(1)
}

// ── Delays ────────────────────────────────────────────────────────────────────

pub fn set_min_delay(env: &Env, d: u64) {
    env.storage().instance().set(&InstanceKey::MinDelay, &d);
}

pub fn get_min_delay(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&InstanceKey::MinDelay)
        .unwrap_or(0)
}

pub fn set_max_delay(env: &Env, d: u64) {
    env.storage().instance().set(&InstanceKey::MaxDelay, &d);
}

pub fn get_max_delay(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&InstanceKey::MaxDelay)
        .unwrap_or(0)
}

// ── Owners ────────────────────────────────────────────────────────────────────

pub fn has_owner(env: &Env, addr: &Address) -> bool {
    env.storage()
        .persistent()
        .has(&DataKey::IsOwner(addr.clone()))
}

// ── Transactions ──────────────────────────────────────────────────────────────

pub fn get_tx_count(env: &Env) -> u32 {
    env.storage()
        .instance()
        .get(&InstanceKey::TxCount)
        .unwrap_or(0)
}

pub fn set_tx_count(env: &Env, n: u32) {
    env.storage().instance().set(&InstanceKey::TxCount, &n);
}

pub fn set_tx(env: &Env, tx: &Transaction) {
    env.storage()
        .persistent()
        .set(&DataKey::Transaction(tx.id), tx);
}

pub fn get_tx(env: &Env, id: u32) -> Result<Transaction, Error> {
    env.storage()
        .persistent()
        .get(&DataKey::Transaction(id))
        .ok_or(Error::TransactionNotFound)
}

// ── Confirmations ─────────────────────────────────────────────────────────────

pub fn is_confirmed(env: &Env, tx_id: u32, owner: &Address) -> bool {
    env.storage()
        .persistent()
        .has(&DataKey::Confirmation(tx_id, owner.clone()))
}

pub fn record_confirmation(env: &Env, tx_id: u32, owner: &Address) {
    env.storage()
        .persistent()
        .set(&DataKey::Confirmation(tx_id, owner.clone()), &true);
}

pub fn remove_confirmation(env: &Env, tx_id: u32, owner: &Address) {
    env.storage()
        .persistent()
        .remove(&DataKey::Confirmation(tx_id, owner.clone()));
}
