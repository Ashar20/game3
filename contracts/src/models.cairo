use starknet::ContractAddress;
use core::num::traits::{SaturatingAdd, SaturatingSub};

// Direction enum for movement (used by actions.cairo)
#[derive(Serde, Copy, Drop, Default, Introspect)]
pub enum Direction {
    // Serialized as 0.
    #[default]
    Left,
    // Serialized as 1.
    Right,
    // Serialized as 2.
    Up,
    // Serialized as 3.
    Down,
}

// Position model (used by actions.cairo)
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Position {
    #[key]
    pub player: ContractAddress,
    pub x: u32,
    pub y: u32,
}

// Moves model (used by actions.cairo)
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Moves {
    #[key]
    pub player: ContractAddress,
    pub remaining: u8,
}

#[generate_trait]
pub impl PositionImpl of PositionTrait {
    fn apply_direction(ref self: Position, direction: Direction) {
        match direction {
            Direction::Left => { self.x = self.x.saturating_sub(1) },
            Direction::Right => { self.x = self.x.saturating_add(1) },
            Direction::Up => { self.y = self.y.saturating_add(1) },
            Direction::Down => { self.y = self.y.saturating_sub(1) },
        }
    }
}

// World Registry - tracks worlds and game counts
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct WorldRegistry {
    #[key]
    pub world_id: u32,
    pub game_count: u32,
    pub creator: ContractAddress,
}

// Player Asset - tracks individual asset ownership for players
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct PlayerAsset {
    #[key]
    pub player_id: ContractAddress,
    #[key]
    pub asset_id: u32,
    pub amount: u32,
}

// Asset Registry - maps asset names to IDs
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct AssetRegistry {
    #[key]
    pub asset_id: u32,
    pub asset_name: felt252,
}

// Game state
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Game {
    #[key]
    pub game_id: u64,
    pub status: u8, // 0=waiting, 1=started, 2=ended
    pub world_id: u32,
    pub participant_a: ContractAddress,
    pub participant_b: ContractAddress,
    pub position_a_x: u32,
    pub position_a_y: u32,
    pub position_b_x: u32,
    pub position_b_y: u32,
    pub hp_a: u32,
    pub hp_b: u32,
    pub alive_a: bool, // true if participant_a is alive
    pub alive_b: bool, // true if participant_b is alive
}

// Collected Asset in a game - indexed by Torii
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct CollectedAsset {
    #[key]
    pub game_id: u64,
    #[key]
    pub asset_id: u32,
    #[key]
    pub collection_index: u32, // To handle multiple same asset_id
    pub participant: u8, // 0 for participant_a, 1 for participant_b
}

// Permanent Asset in a game - indexed by Torii
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct PermanentAsset {
    #[key]
    pub game_id: u64,
    #[key]
    pub asset_id: u32,
    #[key]
    pub permanent_index: u32, // To handle multiple same asset_id
    pub participant: u8, // 0 for participant_a, 1 for participant_b
}

// Counter model for tracking collection and permanent asset indices
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct AssetCounter {
    #[key]
    pub counter_key: felt252, // Hash of (game_id, participant, asset_id)
    pub collection_count: u32, // Count of collected assets
    pub permanent_count: u32, // Count of permanent assets
}
