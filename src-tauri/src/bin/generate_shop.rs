use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use std::fs;
use rand::seq::SliceRandom;
use rand::thread_rng;
use chrono::Utc;
use tokio::time::sleep;

#[derive(Debug, Deserialize)]
struct FortniteApiResponse {
    data: CosmeticData,
}

#[derive(Debug, Deserialize)]
struct CosmeticData {
    br: Vec<Cosmetic>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct Cosmetic {
    id: String,
    name: String,
    description: String,
    #[serde(rename = "type")]
    type_info: TypeInfo,
    rarity: Rarity,
    images: Images,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[allow(non_snake_case)]
struct TypeInfo {
    value: String,
    displayValue: String,
    backendValue: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[allow(non_snake_case)]
struct Rarity {
    value: String,
    displayValue: String,
    backendValue: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[allow(non_snake_case)]
struct Images {
    smallIcon: String,
    icon: String,
    featured: String,
}

#[derive(Serialize)]
#[allow(non_snake_case)]
struct ShopCatalog {
    refreshIntervalHrs: i32,
    dailyPurchaseHrs: i32,
    expiration: String,
    storefronts: Vec<Storefront>,
}

#[derive(Serialize)]
#[allow(non_snake_case)]
struct Storefront {
    name: String,
    catalogEntries: Vec<CatalogEntry>,
}

#[derive(Serialize)]
#[allow(non_snake_case)]
struct CatalogEntry {
    devName: String,
    offerId: String,
    fulfillmentIds: Vec<String>,
    dailyLimit: i32,
    weeklyLimit: i32,
    monthlyLimit: i32,
    categories: Vec<String>,
    prices: Vec<Price>,
    meta: Meta,
    matchFilter: String,
    filterWeight: i32,
    appStoreId: Vec<String>,
    requirements: Vec<Requirement>,
    offerType: String,
    giftInfo: GiftInfo,
    refundable: bool,
    metaInfo: Vec<MetaInfo>,
    displayAssetPath: String,
    itemGrants: Vec<ItemGrant>,
    sortPriority: i32,
    catalogGroupPriority: i32,
}

#[derive(Serialize)]
#[allow(non_snake_case)]
struct Price {
    currencyType: String,
    currencySubType: String,
    regularPrice: i32,
    finalPrice: i32,
    saleExpiration: String,
    basePrice: i32,
}

#[derive(Serialize)]
#[allow(non_snake_case)]
struct Meta {
    SectionId: String,
    TileSize: String,
}

#[derive(Serialize)]
#[allow(non_snake_case)]
struct Requirement {
    requirementType: String,
    requiredId: String,
    minQuantity: i32,
}

#[derive(Serialize)]
#[allow(non_snake_case)]
struct GiftInfo {
    bIsEnabled: bool,
    forcedGiftBoxTemplateId: String,
    purchaseRequirements: Vec<String>,
    giftRecordIds: Vec<String>,
}

#[derive(Serialize)]
#[allow(non_snake_case)]
struct MetaInfo {
    key: String,
    value: String,
}

#[derive(Serialize)]
#[allow(non_snake_case)]
struct ItemGrant {
    templateId: String,
    quantity: i32,
}

const VALID_TYPES: &[&str] = &[
    "outfit", "backpack", "pickaxe", "glider", "emote",
    "wrap", "skydivecontrail", "musicpack", "loadingscreen",
    "banner", "banner_icon", "banner_color", "contrail"
];

const SUPPORTED_SEASONS: &[i32] = &[1, 2, 3, 4, 5, 6, 7, 8, 9];

fn get_rarity_price(rarity: &str) -> i32 {
    match rarity.to_lowercase().as_str() {
        "legendary" | "gaminglegends" => 2000,
        "epic" => 1500,
        "rare" => 1200,
        "uncommon" => 800,
        "common" => 500,
        _ => 800,
    }
}

fn get_item_type_price(item_type: &str) -> i32 {
    match item_type.to_lowercase().as_str() {
        "outfit" => 1500,
        "backpack" => 800,
        "pickaxe" => 800,
        "glider" => 800,
        "emote" => 500,
        "wrap" => 500,
        "skydivecontrail" => 800,
        "musicpack" => 1000,
        "loadingscreen" => 500,
        _ => 500,
    }
}

async fn fetch_cosmetics_for_season(client: &reqwest::Client, season: i32) -> Result<Vec<Cosmetic>, Box<dyn std::error::Error>> {
    let url = format!("https://fortnite-api.com/v2/cosmetics?season={}", season);
    let response = client.get(&url).send().await?;
    let data: FortniteApiResponse = response.json().await?;
    Ok(data.data.br)
}

async fn fetch_all_cosmetics() -> Result<Vec<Cosmetic>, Box<dyn std::error::Error>> {
    let http_client = reqwest::Client::new();
    let mut all_cosmetics = Vec::new();

    for &season in SUPPORTED_SEASONS {
        println!("Fetching season {}...", season);
        match fetch_cosmetics_for_season(&http_client, season).await {
            Ok(cosmetics) => {
                println!("  Found {} cosmetics", cosmetics.len());
                all_cosmetics.extend(cosmetics);
            }
            Err(e) => {
                eprintln!("Error fetching season {}: {}", season, e);
}
            };
            sleep(std::time::Duration::from_millis(500)).await;
        }
    Ok(all_cosmetics)
}

fn filter_shop_cosmetics(cosmetics: Vec<Cosmetic>) -> Vec<Cosmetic> {
    cosmetics.into_iter()
        .filter(|c| {
            let type_val = c.type_info.value.to_lowercase();
            VALID_TYPES.contains(&type_val.as_str())
        })
        .collect()
}

fn build_shop_catalog(cosmetics: &[Cosmetic]) -> Result<(), Box<dyn std::error::Error>> {
    let mut by_type: HashMap<String, Vec<&Cosmetic>> = HashMap::new();
    for c in cosmetics {
        let type_val = c.type_info.value.to_lowercase();
        by_type.entry(type_val).or_default().push(c);
    }

    let mut rng = thread_rng();

    let outfits = by_type.get("outfit").cloned().unwrap_or_default();
    let emotes = by_type.get("emote").cloned().unwrap_or_default();
    let backblings = by_type.get("backpack").cloned().unwrap_or_default();
    let pickaxes = by_type.get("pickaxe").cloned().unwrap_or_default();
    let gliders = by_type.get("glider").cloned().unwrap_or_default();
    let wraps = by_type.get("wrap").cloned().unwrap_or_default();
    let contrails = by_type.get("skydivecontrail").cloned().unwrap_or_default();
    let musicpacks = by_type.get("musicpack").cloned().unwrap_or_default();
    let loadingscreens = by_type.get("loadingscreen").cloned().unwrap_or_default();

    let mut featured_pool = Vec::new();
    featured_pool.extend(outfits);
    featured_pool.extend(backblings);
    featured_pool.extend(pickaxes);
    featured_pool.extend(gliders);

    let mut daily_pool = Vec::new();
    daily_pool.extend(emotes);
    daily_pool.extend(wraps);
    daily_pool.extend(contrails);
    daily_pool.extend(musicpacks);
    daily_pool.extend(loadingscreens);

    featured_pool.shuffle(&mut rng);
    daily_pool.shuffle(&mut rng);

    let featured_count = 20.min(featured_pool.len());
    let featured_items = &featured_pool[..featured_count];

    let daily_count = 30.min(daily_pool.len());
    let daily_items = &daily_pool[..daily_count];

    let mut featured_entries = Vec::new();
    for (idx, cosmetic) in featured_items.iter().enumerate() {
        let price = get_rarity_price(&cosmetic.rarity.value);
        let offer_id = format!("offer_{}", cosmetic.id);

        featured_entries.push(CatalogEntry {
            devName: cosmetic.name.clone(),
            offerId: offer_id.clone(),
            fulfillmentIds: vec![],
            dailyLimit: -1,
            weeklyLimit: -1,
            monthlyLimit: -1,
            categories: vec![],
            prices: vec![Price {
                currencyType: "MtxCurrency".to_string(),
                currencySubType: "".to_string(),
                regularPrice: price,
                finalPrice: price,
                saleExpiration: "9999-12-31T23:59:59.999Z".to_string(),
                basePrice: price,
            }],
            meta: Meta {
                SectionId: "Featured".to_string(),
                TileSize: "Normal".to_string(),
            },
            matchFilter: "".to_string(),
            filterWeight: 0,
            appStoreId: vec![],
            requirements: vec![Requirement {
                requirementType: "DenyOnItemOwnership".to_string(),
                requiredId: cosmetic.id.clone(),
                minQuantity: 1,
            }],
            offerType: "StaticPrice".to_string(),
            giftInfo: GiftInfo {
                bIsEnabled: true,
                forcedGiftBoxTemplateId: "".to_string(),
                purchaseRequirements: vec![],
                giftRecordIds: vec![],
            },
            refundable: true,
            metaInfo: vec![
                MetaInfo { key: "SectionId".to_string(), value: "Featured".to_string() },
                MetaInfo { key: "TileSize".to_string(), value: "Normal".to_string() },
            ],
            displayAssetPath: if cosmetic.images.featured.is_empty() { cosmetic.images.icon.clone() } else { cosmetic.images.featured.clone() },
            itemGrants: vec![ItemGrant {
                templateId: cosmetic.id.clone(),
                quantity: 1,
            }],
            sortPriority: -(idx as isize) as i32,
            catalogGroupPriority: 0,
        });
    }

    let mut daily_entries = Vec::new();
    for (idx, cosmetic) in daily_items.iter().enumerate() {
        let price = get_item_type_price(&cosmetic.type_info.value);
        let offer_id = format!("offer_{}", cosmetic.id);

        daily_entries.push(CatalogEntry {
            devName: cosmetic.name.clone(),
            offerId: offer_id.clone(),
            fulfillmentIds: vec![],
            dailyLimit: -1,
            weeklyLimit: -1,
            monthlyLimit: -1,
            categories: vec![],
            prices: vec![Price {
                currencyType: "MtxCurrency".to_string(),
                currencySubType: "".to_string(),
                regularPrice: price,
                finalPrice: price,
                saleExpiration: "9999-12-31T23:59:59.999Z".to_string(),
                basePrice: price,
            }],
            meta: Meta {
                SectionId: "Daily".to_string(),
                TileSize: "Small".to_string(),
            },
            matchFilter: "".to_string(),
            filterWeight: 0,
            appStoreId: vec![],
            requirements: vec![Requirement {
                requirementType: "DenyOnItemOwnership".to_string(),
                requiredId: cosmetic.id.clone(),
                minQuantity: 1,
            }],
            offerType: "StaticPrice".to_string(),
            giftInfo: GiftInfo {
                bIsEnabled: true,
                forcedGiftBoxTemplateId: "".to_string(),
                purchaseRequirements: vec![],
                giftRecordIds: vec![],
            },
            refundable: true,
            metaInfo: vec![
                MetaInfo { key: "SectionId".to_string(), value: "Daily".to_string() },
                MetaInfo { key: "TileSize".to_string(), value: "Small".to_string() },
            ],
            displayAssetPath: cosmetic.images.icon.clone(),
            itemGrants: vec![ItemGrant {
                templateId: cosmetic.id.clone(),
                quantity: 1,
            }],
            sortPriority: -(idx as isize) as i32,
            catalogGroupPriority: 0,
        });
    }

    let catalog = ShopCatalog {
        refreshIntervalHrs: 24,
        dailyPurchaseHrs: 24,
        expiration: Utc::now().to_rfc3339(),
        storefronts: vec![
            Storefront {
                name: "BRDailyStorefront".to_string(),
                catalogEntries: daily_entries,
            },
            Storefront {
                name: "BRWeeklyStorefront".to_string(),
                catalogEntries: featured_entries,
            },
            Storefront {
                name: "BRSeasonStorefront".to_string(),
                catalogEntries: vec![],
            },
        ],
    };

    let json = serde_json::to_string_pretty(&catalog)?;

    fs::write("catalog.json", json)?;
    println!("Catalog saved to catalog.json");

    let cosmetics_json = serde_json::to_string_pretty(&cosmetics)?;
    fs::write("cosmetics.json", cosmetics_json)?;
    println!("Cosmetics saved to cosmetics.json");

    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("Fetching cosmetics from fortnite-api.com for seasons 1-9...");
    let all_cosmetics = fetch_all_cosmetics().await?;

    println!("Total cosmetics fetched: {}", all_cosmetics.len());

    let shop_cosmetics = filter_shop_cosmetics(all_cosmetics);
    println!("Valid shop cosmetics: {}", shop_cosmetics.len());

    build_shop_catalog(&shop_cosmetics)?;

    Ok(())
}